using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using Inflame_Backend.Models.CRM;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Authentication.Commands
{
    /// <summary>
    /// MediatR command and handler for provisioning new staff accounts with a default "Employee" role.
    /// Validates the Employee role exists, checks email uniqueness, creates the ASP.NET Core Identity user,
    /// assigns the role, and inserts a corresponding record into the CRM staff repository with rollback on failure.
    /// </summary>
    public record CreateStaffAccountCommand(
        string Email,
        string Password,
        string FullName
    ) : IRequest<CreateStaffAccountResponseDto>;


    public class CreateStaffAccountCommandHandler
        : IRequestHandler<
            CreateStaffAccountCommand,
            CreateStaffAccountResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly IStaffAccountRepository _staffAccountRepository;

        public CreateStaffAccountCommandHandler(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            IStaffAccountRepository staffAccountRepository)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _staffAccountRepository = staffAccountRepository;
        }

        public async Task<CreateStaffAccountResponseDto> Handle(
            CreateStaffAccountCommand request,
            CancellationToken cancellationToken)
        {
            var role = "Employee";

            // Validate the default Employee role.
            if (!await _roleManager.RoleExistsAsync(role))
            {
                return new CreateStaffAccountResponseDto
                {
                    Success = false,
                    Message = "Employee role does not exist."
                };
            }

            // Check whether the Identity account already exists.
            var existingUser =
                await _userManager.FindByEmailAsync(request.Email);

            if (existingUser != null)
            {
                return new CreateStaffAccountResponseDto
                {
                    Success = false,
                    Message = "A user with this email already exists."
                };
            }

            // Create the Identity user.
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FullName = request.FullName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var identityResult =
                await _userManager.CreateAsync(
                    user,
                    request.Password);

            if (!identityResult.Succeeded)
            {
                var errors = string.Join(
                    "; ",
                    identityResult.Errors.Select(
                        error => error.Description));

                return new CreateStaffAccountResponseDto
                {
                    Success = false,
                    Message = errors
                };
            }

            // Assign the Identity role.
            var roleResult =
                await _userManager.AddToRoleAsync(
                    user,
                    role);

            if (!roleResult.Succeeded)
            {
                // Clean up the Identity user if role assignment fails.
                await _userManager.DeleteAsync(user);

                var errors = string.Join(
                    "; ",
                    roleResult.Errors.Select(
                        error => error.Description));

                return new CreateStaffAccountResponseDto
                {
                    Success = false,
                    Message = errors
                };
            }

            // Create the CRM StaffAccount.
            var staffAccount = new StaffAccount
            {
                StaffId = Guid.NewGuid(),
                IdentityUserId = user.Id,
                Email = request.Email,
                FullName = request.FullName,
                Role = role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                await _staffAccountRepository.AddAsync(
                    staffAccount);
            }
            catch
            {
                // If the CRM record cannot be created,
                // remove the Identity user we just created.
                await _userManager.DeleteAsync(user);

                throw;
            }

            return new CreateStaffAccountResponseDto
            {
                Success = true,
                Message = "Staff account created successfully.",
                StaffId = staffAccount.StaffId,
                IdentityUserId = user.Id
            };
        }
    }
}