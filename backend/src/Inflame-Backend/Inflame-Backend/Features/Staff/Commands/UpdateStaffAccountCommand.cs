using Inflame_Backend.Data.Adapters;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Staff.Commands
{
    #region Command
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Command to update an existing staff account.
    /// </summary>
    public record UpdateStaffAccountCommand(
        Guid StaffId,
        string Email,
        string FullName,
        string Role,
        bool IsActive,
        string? NewPassword,
        IFormFile? ProfileImage,
        string RequestingUserRole
    ) : IRequest<UpdateStaffAccountResponseDto>;
    #endregion

    #region Handler
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the UpdateStaffAccountCommand.
    /// </summary>
    public class UpdateStaffAccountCommandHandler
        : IRequestHandler<
            UpdateStaffAccountCommand,
            UpdateStaffAccountResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly IStaffAccountRepository _staffAccountRepository;
        private readonly IStorageAdapter _storageAdapter;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Constructor for UpdateStaffAccountCommandHandler.
        /// </summary>
        public UpdateStaffAccountCommandHandler(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            IStaffAccountRepository staffAccountRepository,
            IStorageAdapter storageAdapter)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _staffAccountRepository = staffAccountRepository;
            _storageAdapter = storageAdapter;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Processes the UpdateStaffAccountCommand.
        /// </summary>
        public async Task<UpdateStaffAccountResponseDto> Handle(
            UpdateStaffAccountCommand request,
            CancellationToken cancellationToken)
        {
            // Find the CRM staff account.
            var staffAccount =
                await _staffAccountRepository.GetByIdAsync(
                    request.StaffId);

            if (staffAccount == null)
            {
                return new UpdateStaffAccountResponseDto
                {
                    Success = false,
                    Message = "Staff account not found."
                };
            }

            // An Admin may only edit Employee accounts.
            if (request.RequestingUserRole == "Admin")
            {
                if (staffAccount.Role != "Employee")
                {
                    return new UpdateStaffAccountResponseDto
                    {
                        Success = false,
                        Message = "Forbidden: Admins can only edit Employee accounts."
                    };
                }

                if (request.Role != "Employee")
                {
                    return new UpdateStaffAccountResponseDto
                    {
                        Success = false,
                        Message = "Forbidden: Admins can only assign the Employee role."
                    };
                }
            }

            // Find the corresponding ASP.NET Identity user.
            var user =
                await _userManager.FindByIdAsync(
                    staffAccount.IdentityUserId.ToString());

            if (user == null)
            {
                return new UpdateStaffAccountResponseDto
                {
                    Success = false,
                    Message = "Identity user not found."
                };
            }

            // Validate that the requested role exists.
            if (!await _roleManager.RoleExistsAsync(request.Role))
            {
                return new UpdateStaffAccountResponseDto
                {
                    Success = false,
                    Message = $"Role '{request.Role}' does not exist."
                };
            }

            // SuperAdmin cannot be assigned through this edit operation.
            if (request.Role == "SuperAdmin")
            {
                return new UpdateStaffAccountResponseDto
                {
                    Success = false,
                    Message = "The SuperAdmin role cannot be assigned through this operation."
                };
            }

            // Get the user's current Identity role.
            var currentRoles =
                await _userManager.GetRolesAsync(user);

            var currentRole =
                currentRoles.FirstOrDefault();

            // Do not allow editing a SuperAdmin through this operation.
            if (currentRole == "SuperAdmin")
            {
                return new UpdateStaffAccountResponseDto
                {
                    Success = false,
                    Message = "SuperAdmin accounts cannot be edited through this operation."
                };
            }

            // Update Identity email.
            user.Email = request.Email;
            user.UserName = request.Email;

            // Update Identity profile information.
            user.FullName = request.FullName;
            user.IsActive = request.IsActive;

            var identityUpdateResult =
                await _userManager.UpdateAsync(user);

            if (!identityUpdateResult.Succeeded)
            {
                var errors = string.Join(
                    "; ",
                    identityUpdateResult.Errors.Select(
                        error => error.Description));

                return new UpdateStaffAccountResponseDto
                {
                    Success = false,
                    Message = errors
                };
            }

            // Update password only when one was supplied.
            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                var removePasswordResult =
                    await _userManager.RemovePasswordAsync(user);

                if (!removePasswordResult.Succeeded)
                {
                    var errors = string.Join(
                        "; ",
                        removePasswordResult.Errors.Select(
                            error => error.Description));

                    return new UpdateStaffAccountResponseDto
                    {
                        Success = false,
                        Message = errors
                    };
                }

                var addPasswordResult =
                    await _userManager.AddPasswordAsync(
                        user,
                        request.NewPassword);

                if (!addPasswordResult.Succeeded)
                {
                    var errors = string.Join(
                        "; ",
                        addPasswordResult.Errors.Select(
                            error => error.Description));

                    return new UpdateStaffAccountResponseDto
                    {
                        Success = false,
                        Message = errors
                    };
                }
            }

            // Change the Identity role if necessary.
            if (!string.Equals(
                    currentRole,
                    request.Role,
                    StringComparison.OrdinalIgnoreCase))
            {
                if (currentRoles.Count > 0)
                {
                    var removeRolesResult =
                        await _userManager.RemoveFromRolesAsync(
                            user,
                            currentRoles);

                    if (!removeRolesResult.Succeeded)
                    {
                        var errors = string.Join(
                            "; ",
                            removeRolesResult.Errors.Select(
                                error => error.Description));

                        return new UpdateStaffAccountResponseDto
                        {
                            Success = false,
                            Message = errors
                        };
                    }
                }

                var addRoleResult =
                    await _userManager.AddToRoleAsync(
                        user,
                        request.Role);

                if (!addRoleResult.Succeeded)
                {
                    var errors = string.Join(
                        "; ",
                        addRoleResult.Errors.Select(
                            error => error.Description));

                    return new UpdateStaffAccountResponseDto
                    {
                        Success = false,
                        Message = errors
                    };
                }
            }

            // Handle optional profile image replacement.
            if (request.ProfileImage != null &&
                request.ProfileImage.Length > 0)
            {
                var oldProfileImageUrl =
                    staffAccount.ProfileImageUrl;

                var extension =
                    Path.GetExtension(
                        request.ProfileImage.FileName);

                var uniqueFileName =
                    $"{Guid.NewGuid()}{extension}";

                using var memoryStream =
                    new MemoryStream();

                await request.ProfileImage.CopyToAsync(
                    memoryStream,
                    cancellationToken);

                var fileBytes =
                    memoryStream.ToArray();

                await _storageAdapter.UploadFileAsync(
                    "staff",
                    uniqueFileName,
                    fileBytes);

                var newProfileImageUrl =
                    _storageAdapter.GetFileUrl(
                        "staff",
                        uniqueFileName);

                staffAccount.ProfileImageUrl =
                    newProfileImageUrl;

                // Delete the old image after the new image
                // has been uploaded successfully.
                if (!string.IsNullOrWhiteSpace(
                        oldProfileImageUrl))
                {
                    try
                    {
                        var oldFileName =
                            Path.GetFileName(
                                new Uri(oldProfileImageUrl).AbsolutePath);

                        if (!string.IsNullOrWhiteSpace(oldFileName))
                        {
                            await _storageAdapter.DeleteFileAsync(
                                "staff",
                                oldFileName);
                        }
                    }
                    catch
                    {
                        // The account update can still succeed even
                        // if the old image cannot be removed.
                    }
                }
            }

            // Update the CRM staff account.
            staffAccount.Email = request.Email;
            staffAccount.FullName = request.FullName;
            staffAccount.Role = request.Role;
            staffAccount.IsActive = request.IsActive;

            await _staffAccountRepository.UpdateAsync(
                staffAccount);

            return new UpdateStaffAccountResponseDto
            {
                Success = true,
                Message = "Staff account updated successfully.",
                StaffId = staffAccount.StaffId,
                IdentityUserId = user.Id
            };
        }
    }
    #endregion
}
//---------------------END OF FILE------------------------------------------------------------------//