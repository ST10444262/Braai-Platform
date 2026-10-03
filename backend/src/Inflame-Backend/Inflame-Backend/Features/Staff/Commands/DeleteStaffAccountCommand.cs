using Inflame_Backend.Data.Adapters;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Staff.Commands
{
    /// <summary>
    /// Deletes a staff account from both the CRM staff_account
    /// table and ASP.NET Core Identity.
    /// </summary>
    public record DeleteStaffAccountCommand(
        Guid StaffId,
        Guid RequestingUserId,
        string RequestingRole
    ) : IRequest<DeleteStaffAccountResponseDto>;

    public class DeleteStaffAccountCommandHandler
        : IRequestHandler<
            DeleteStaffAccountCommand,
            DeleteStaffAccountResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IStaffAccountRepository _staffAccountRepository;
        private readonly IStorageAdapter _storageAdapter;

        public DeleteStaffAccountCommandHandler(
            UserManager<ApplicationUser> userManager,
            IStaffAccountRepository staffAccountRepository,
            IStorageAdapter storageAdapter)
        {
            _userManager = userManager;
            _staffAccountRepository = staffAccountRepository;
            _storageAdapter = storageAdapter;
        }

        public async Task<DeleteStaffAccountResponseDto> Handle(
            DeleteStaffAccountCommand request,
            CancellationToken cancellationToken)
        {
            // Find the CRM staff account.
            var staffAccount =
                await _staffAccountRepository.GetByIdAsync(
                    request.StaffId);

            if (staffAccount == null)
            {
                return new DeleteStaffAccountResponseDto
                {
                    Success = false,
                    Message = "Staff account not found."
                };
            }

            // A user cannot delete their own account through this operation.
            if (staffAccount.IdentityUserId ==
                request.RequestingUserId)
            {
                return new DeleteStaffAccountResponseDto
                {
                    Success = false,
                    Message = "You cannot delete your own staff account."
                };
            }

            // SuperAdmin accounts are protected.
            if (string.Equals(
                    staffAccount.Role,
                    "SuperAdmin",
                    StringComparison.OrdinalIgnoreCase))
            {
                return new DeleteStaffAccountResponseDto
                {
                    Success = false,
                    Message = "SuperAdmin accounts cannot be deleted."
                };
            }

            // Admins may only delete Employees.
            if (string.Equals(
                    request.RequestingRole,
                    "Admin",
                    StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(
                    staffAccount.Role,
                    "Employee",
                    StringComparison.OrdinalIgnoreCase))
            {
                return new DeleteStaffAccountResponseDto
                {
                    Success = false,
                    Message = "Admins can only delete Employee accounts."
                };
            }

            // Find the corresponding Identity user.
            var user =
                await _userManager.FindByIdAsync(
                    staffAccount.IdentityUserId.ToString());

            if (user == null)
            {
                return new DeleteStaffAccountResponseDto
                {
                    Success = false,
                    Message = "Identity user not found."
                };
            }

            // Delete the profile image first.
            if (!string.IsNullOrWhiteSpace(
                    staffAccount.ProfileImageUrl))
            {
                try
                {
                    var oldFileName =
                        Path.GetFileName(
                            new Uri(
                                staffAccount.ProfileImageUrl)
                            .AbsolutePath);

                    if (!string.IsNullOrWhiteSpace(oldFileName))
                    {
                        await _storageAdapter.DeleteFileAsync(
                            "staff",
                            oldFileName);
                    }
                }
                catch
                {
                    // The database accounts should still be removable
                    // even if the old storage object cannot be deleted.
                }
            }

            // Delete the CRM StaffAccount.
            try
            {
                await _staffAccountRepository.DeleteAsync(
                    staffAccount);
            }
            catch (Exception ex)
            {
                return new DeleteStaffAccountResponseDto
                {
                    Success = false,
                    Message =
                        $"Failed to delete the CRM staff account: {ex.Message}"
                };
            }

            // Delete the Identity user.
            var identityResult =
                await _userManager.DeleteAsync(user);

            if (!identityResult.Succeeded)
            {
                var errors = string.Join(
                    "; ",
                    identityResult.Errors.Select(
                        error => error.Description));

                return new DeleteStaffAccountResponseDto
                {
                    Success = false,
                    Message =
                        "The CRM staff account was deleted, but the Identity account could not be deleted: "
                        + errors,
                    StaffId = staffAccount.StaffId,
                    IdentityUserId = user.Id
                };
            }

            return new DeleteStaffAccountResponseDto
            {
                Success = true,
                Message = "Staff account deleted successfully.",
                StaffId = staffAccount.StaffId,
                IdentityUserId = user.Id
            };
        }
    }
}