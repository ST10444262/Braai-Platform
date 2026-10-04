using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using Inflame_Backend.Services.Authentication;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Inflame_Backend.Features.Authentication.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// MediatR command and handler for verifying a two factor code.
    /// </summary>
    public record VerifyTwoFactorCommand(
        string Challenge,
        string Code
    ) : IRequest<VerifyTwoFactorResponseDto>;

    //------------------------------------------------------------------------------------------//
    public class VerifyTwoFactorCommandHandler
        : IRequestHandler<
            VerifyTwoFactorCommand,
            VerifyTwoFactorResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly TwoFactorChallengeService _twoFactorChallengeService;
        private readonly JwtTokenService _jwtTokenService;
        private readonly IConfiguration _configuration;

        //------------------------------------------------------------------------------------------//
        public VerifyTwoFactorCommandHandler(
            UserManager<ApplicationUser> userManager,
            TwoFactorChallengeService twoFactorChallengeService,
            JwtTokenService jwtTokenService,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _twoFactorChallengeService = twoFactorChallengeService;
            _jwtTokenService = jwtTokenService;
            _configuration = configuration;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Handles the request to verify the two factor token.
        /// </summary>
        public async Task<VerifyTwoFactorResponseDto> Handle(
            VerifyTwoFactorCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Challenge))
            {
                return new VerifyTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Two-factor setup challenge is required.",
                    TwoFactorEnabled = false
                };
            }

            var challengeIsValid =
                _twoFactorChallengeService.TryReadChallenge(
                    request.Challenge,
                    out var userId,
                    out var purpose);

            if (!challengeIsValid)
            {
                return new VerifyTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Two-factor setup challenge is invalid or expired.",
                    TwoFactorEnabled = false
                };
            }

            if (purpose != "setup")
            {
                return new VerifyTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Invalid two-factor setup challenge.",
                    TwoFactorEnabled = false
                };
            }

            var user = await _userManager.FindByIdAsync(
                userId.ToString());

            if (user == null)
            {
                return new VerifyTwoFactorResponseDto
                {
                    Success = false,
                    Message = "User not found.",
                    TwoFactorEnabled = false
                };
            }

            if (!user.IsActive)
            {
                return new VerifyTwoFactorResponseDto
                {
                    Success = false,
                    Message = "User account is inactive.",
                    TwoFactorEnabled = false
                };
            }

            var code = request.Code
                .Replace(" ", string.Empty)
                .Replace("-", string.Empty);

            if (code.Length != 6 ||
                !code.All(char.IsDigit))
            {
                return new VerifyTwoFactorResponseDto
                {
                    Success = false,
                    Message = "The authenticator code must contain 6 digits.",
                    TwoFactorEnabled = false
                };
            }

            var isValid =
                await _userManager.VerifyTwoFactorTokenAsync(
                    user,
                    TokenOptions.DefaultAuthenticatorProvider,
                    code);

            if (!isValid)
            {
                return new VerifyTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Invalid authenticator code.",
                    TwoFactorEnabled = false
                };
            }

            var result =
                await _userManager.SetTwoFactorEnabledAsync(
                    user,
                    true);

            if (!result.Succeeded)
            {
                return new VerifyTwoFactorResponseDto
                {
                    Success = false,
                    Message = "The code was valid, but 2FA could not be enabled.",
                    TwoFactorEnabled = false
                };
            }

            var token =
                await _jwtTokenService.GenerateTokenAsync(user);

            var expiryMinutes =
                _configuration.GetValue<int>(
                    "Jwt:ExpiryMinutes");

            return new VerifyTwoFactorResponseDto
            {
                Success = true,
                Message = "Two-factor authentication enabled successfully.",
                TwoFactorEnabled = true,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
            };
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//