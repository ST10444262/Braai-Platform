using Inflame_Backend.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Authentication.Commands
{
    #region Command
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Command to change the password of an existing user.
    /// </summary>
    public record ChangePasswordCommand(Guid UserId, string CurrentPassword, string NewPassword) : IRequest<ChangePasswordResponseDto>;
    #endregion

    #region Response DTO
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Response payload for the change password operation.
    /// </summary>
    public class ChangePasswordResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
    #endregion

    #region Handler
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the ChangePasswordCommand to update a user's password securely.
    /// </summary>
    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, ChangePasswordResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Constructor for ChangePasswordCommandHandler.
        /// </summary>
        public ChangePasswordCommandHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Processes the ChangePasswordCommand to apply the password change in the Identity store.
        /// </summary>
        public async Task<ChangePasswordResponseDto> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());

            if (user == null)
            {
                return new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

            if (!result.Succeeded)
            {
                return new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = string.Join("; ", result.Errors.Select(e => e.Description))
                };
            }

            return new ChangePasswordResponseDto
            {
                Success = true,
                Message = "Password updated."
            };
        }
    }
    #endregion
}
//---------------------END OF FILE------------------------------------------------------------------//
