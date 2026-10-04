using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using Inflame_Backend.Services.Authentication;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Inflame_Backend.Features.Authentication.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// MediatR command and handler for verifying a login two factor code using a signed challenge token.
    /// </summary>
    public record VerifyLoginTwoFactorCommand(
        string Challenge,
        string Code,
        bool RememberDevice
    ) : IRequest<VerifyLoginTwoFactorResponseDto>;

    //------------------------------------------------------------------------------------------//
    public class VerifyLoginTwoFactorCommandHandler
        : IRequestHandler<
            VerifyLoginTwoFactorCommand,
            VerifyLoginTwoFactorResponseDto>
    {
        #region Dependencies
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly TwoFactorChallengeService _twoFactorChallengeService;
        private readonly JwtTokenService _jwtTokenService;
        private readonly IConfiguration _configuration;
        private readonly TrustedDeviceService _trustedDeviceService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        //------------------------------------------------------------------------------------------//
        public VerifyLoginTwoFactorCommandHandler(
            UserManager<ApplicationUser> userManager,
            TwoFactorChallengeService twoFactorChallengeService,
            JwtTokenService jwtTokenService,
            IConfiguration configuration,
            TrustedDeviceService trustedDeviceService,
            IHttpContextAccessor httpContextAccessor)
        {
            _userManager = userManager;
            _twoFactorChallengeService = twoFactorChallengeService;
            _jwtTokenService = jwtTokenService;
            _configuration = configuration;
            _trustedDeviceService = trustedDeviceService;
            _httpContextAccessor = httpContextAccessor;
        }
        #endregion

        #region Execution
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Handles the request to verify the two factor login code.
        /// </summary>
        public async Task<VerifyLoginTwoFactorResponseDto> Handle(
            VerifyLoginTwoFactorCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Challenge))
            {
                return new VerifyLoginTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Two-factor challenge is required."
                };
            }

            if (!_twoFactorChallengeService.TryReadChallenge(
                    request.Challenge,
                    out var userId,
                    out var purpose))
            {
                return new VerifyLoginTwoFactorResponseDto
                {
                    Success = false,
                    Message = "The two-factor challenge is invalid or expired."
                };
            }

            if (!string.Equals(
                    purpose,
                    "login",
                    StringComparison.Ordinal))
            {
                return new VerifyLoginTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Invalid two-factor challenge."
                };
            }

            var user =
                await _userManager.FindByIdAsync(
                    userId.ToString());

            if (user == null)
            {
                return new VerifyLoginTwoFactorResponseDto
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            if (!user.IsActive)
            {
                return new VerifyLoginTwoFactorResponseDto
                {
                    Success = false,
                    Message = "This account is inactive."
                };
            }

            var twoFactorEnabled =
                await _userManager.GetTwoFactorEnabledAsync(user);

            if (!twoFactorEnabled)
            {
                return new VerifyLoginTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Two-factor authentication is not enabled."
                };
            }

            var code = request.Code
                .Replace(" ", string.Empty)
                .Replace("-", string.Empty);

            if (code.Length != 6 ||
                !code.All(char.IsDigit))
            {
                return new VerifyLoginTwoFactorResponseDto
                {
                    Success = false,
                    Message = "The authenticator code must contain 6 digits."
                };
            }

            var isValid =
                await _userManager.VerifyTwoFactorTokenAsync(
                    user,
                    TokenOptions.DefaultAuthenticatorProvider,
                    code);

            if (!isValid)
            {
                return new VerifyLoginTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Invalid authenticator code."
                };
            }

            var token =
                await _jwtTokenService.GenerateTokenAsync(user);

            var expiryMinutes =
                _configuration.GetValue<int>("Jwt:ExpiryMinutes");

            if (expiryMinutes <= 0)
            {
                expiryMinutes = 60;
            }

            if (request.RememberDevice)
            {
                var trustedDeviceExpiration =
                    _trustedDeviceService.GetExpiration();

                var trustedDeviceToken =
                    await _trustedDeviceService.CreateTokenAsync(
                        user.Id,
                        trustedDeviceExpiration);

                _httpContextAccessor.HttpContext?.Response.Cookies.Append(
                    "Inflame.TrustedDevice",
                    trustedDeviceToken,
                    new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.Strict,
                        Expires = trustedDeviceExpiration,
                        IsEssential = true
                    });
            }

            return new VerifyLoginTwoFactorResponseDto
            {
                Success = true,
                Message = "Two-factor authentication successful.",
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
            };
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//