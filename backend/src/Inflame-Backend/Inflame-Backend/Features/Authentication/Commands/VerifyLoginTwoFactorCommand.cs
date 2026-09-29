using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Authentication.Commands
{
    public record VerifyLoginTwoFactorCommand(
        Guid UserId,
        string Code
    ) : IRequest<VerifyLoginTwoFactorResponseDto>;

    public class VerifyLoginTwoFactorCommandHandler
        : IRequestHandler<
            VerifyLoginTwoFactorCommand,
            VerifyLoginTwoFactorResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtTokenService _jwtTokenService;

        public VerifyLoginTwoFactorCommandHandler(
            UserManager<ApplicationUser> userManager,
            JwtTokenService jwtTokenService)
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<VerifyLoginTwoFactorResponseDto> Handle(
            VerifyLoginTwoFactorCommand request,
            CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(
                request.UserId.ToString());

            if (user == null)
            {
                return new VerifyLoginTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Invalid two-factor authentication request."
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
                60;

            return new VerifyLoginTwoFactorResponseDto
            {
                Success = true,
                Message = "Two-factor authentication successful.",
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
            };
        }
    }
}