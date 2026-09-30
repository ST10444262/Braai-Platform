using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Authentication.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// MediatR command and handler for verifying a two factor code.
    /// </summary>
    public record VerifyTwoFactorCommand(
        Guid UserId,
        string Code
    ) : IRequest<VerifyTwoFactorResponseDto>;

    //------------------------------------------------------------------------------------------//
    public class VerifyTwoFactorCommandHandler
        : IRequestHandler<
            VerifyTwoFactorCommand,
            VerifyTwoFactorResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        //------------------------------------------------------------------------------------------//
        public VerifyTwoFactorCommandHandler(
            UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Handles the request to verify the two factor token.
        /// </summary>
        public async Task<VerifyTwoFactorResponseDto> Handle(
            VerifyTwoFactorCommand request,
            CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(
                request.UserId.ToString());

            if (user == null)
            {
                return new VerifyTwoFactorResponseDto
                {
                    Success = false,
                    Message = "User not found.",
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

            return new VerifyTwoFactorResponseDto
            {
                Success = true,
                Message = "Two-factor authentication enabled successfully.",
                TwoFactorEnabled = true
            };
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//