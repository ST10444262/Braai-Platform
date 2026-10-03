using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Authentication.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// MediatR command for allowing an administrator to reset
    /// two-factor authentication for a staff member.
    /// </summary>
    public record ResetTwoFactorCommand(
        Guid UserId
    ) : IRequest<ResetTwoFactorResponseDto>;

    //------------------------------------------------------------------------------------------//
    public class ResetTwoFactorCommandHandler
        : IRequestHandler<
            ResetTwoFactorCommand,
            ResetTwoFactorResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        //------------------------------------------------------------------------------------------//
        public ResetTwoFactorCommandHandler(
            UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Disables two-factor authentication and generates
        /// a new authenticator key for the specified user.
        /// </summary>
        public async Task<ResetTwoFactorResponseDto> Handle(
            ResetTwoFactorCommand request,
            CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(
                request.UserId.ToString());

            if (user == null)
            {
                return new ResetTwoFactorResponseDto
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            var disableResult =
                await _userManager.SetTwoFactorEnabledAsync(
                    user,
                    false);

            if (!disableResult.Succeeded)
            {
                return new ResetTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Unable to disable two-factor authentication."
                };
            }

            var resetKeyResult =
                await _userManager.ResetAuthenticatorKeyAsync(user);

            if (!resetKeyResult.Succeeded)
            {
                return new ResetTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Two-factor authentication was disabled, but the authenticator key could not be reset."
                };
            }

            return new ResetTwoFactorResponseDto
            {
                Success = true,
                Message = "Two-factor authentication has been reset successfully."
            };
        }
    }
}