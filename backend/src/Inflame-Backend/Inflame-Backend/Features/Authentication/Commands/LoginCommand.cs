using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using Inflame_Backend.Services.Authentication;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Inflame_Backend.Features.Authentication.Commands
{
    /// <summary>
    /// MediatR command and handler for authenticating users.
    /// Validates credentials, checks account active status and 2FA requirements,
    /// and generates a signed JWT upon successful login or issues a challenge token.
    /// </summary>
    public record LoginCommand(
        string Email,
        string Password
    ) : IRequest<LoginResponseDto>;

    //------------------------------------------------------------------------------------------//
    public class LoginCommandHandler
        : IRequestHandler<LoginCommand, LoginResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtTokenService _jwtTokenService;
        private readonly TwoFactorChallengeService _twoFactorChallengeService;
        private readonly TrustedDeviceService _trustedDeviceService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;

        //------------------------------------------------------------------------------------------//
        public LoginCommandHandler(
            UserManager<ApplicationUser> userManager,
            JwtTokenService jwtTokenService,
            TwoFactorChallengeService twoFactorChallengeService,
            TrustedDeviceService trustedDeviceService,
            IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
            _twoFactorChallengeService = twoFactorChallengeService;
            _trustedDeviceService = trustedDeviceService;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Handles the login request.
        /// </summary>
        public async Task<LoginResponseDto> Handle(
            LoginCommand request,
            CancellationToken cancellationToken)
        {
            var user =
                await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password."
                };
            }

            if (!user.IsActive)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "This account is inactive."
                };
            }

            var passwordValid =
                await _userManager.CheckPasswordAsync(
                    user,
                    request.Password);

            if (!passwordValid)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password."
                };
            }

            var twoFactorEnabled =
                await _userManager.GetTwoFactorEnabledAsync(user);

            if (twoFactorEnabled)
            {
                var trustedDeviceToken =
                    _httpContextAccessor.HttpContext?
                        .Request.Cookies["Inflame.TrustedDevice"];

                var trustedDeviceIsValid =
                    _trustedDeviceService.TryValidateToken(
                        trustedDeviceToken ?? string.Empty,
                        user.Id);

                if (trustedDeviceIsValid)
                {
                    var token =
                        await _jwtTokenService.GenerateTokenAsync(user);

                    var expiryMinutes =
                        _configuration.GetValue<int>("Jwt:ExpiryMinutes");

                    if (expiryMinutes <= 0)
                    {
                        expiryMinutes = 60;
                    }

                    return new LoginResponseDto
                    {
                        Success = true,
                        RequiresTwoFactor = false,
                        RequiresTwoFactorSetup = false,
                        UserId = user.Id,
                        Token = token,
                        ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
                        Message = "Login successful. Trusted device recognized."
                    };
                }

                var challenge =
                    _twoFactorChallengeService.CreateChallenge(
                        user.Id,
                        "login");

                return new LoginResponseDto
                {
                    Success = true,
                    RequiresTwoFactor = true,
                    RequiresTwoFactorSetup = false,
                    UserId = user.Id,
                    TwoFactorChallenge = challenge,
                    Message = "Two-factor authentication required."
                };
            }

            var setupChallenge =
                _twoFactorChallengeService.CreateChallenge(
                    user.Id,
                    "setup");

            return new LoginResponseDto
            {
                Success = true,
                RequiresTwoFactor = false,
                RequiresTwoFactorSetup = true,
                UserId = user.Id,
                TwoFactorChallenge = setupChallenge,
                Message = "Two-factor authentication setup is required."
            };
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//