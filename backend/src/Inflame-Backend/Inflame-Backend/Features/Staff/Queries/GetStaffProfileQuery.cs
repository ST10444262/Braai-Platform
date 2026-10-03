using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Staff.Queries
{
    #region Query
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Query to retrieve a staff member's profile using their Identity User ID.
    /// </summary>
    public record GetStaffProfileQuery(Guid UserId) : IRequest<GetStaffProfileResponseDto>;
    #endregion

    #region Response DTO
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Response payload containing the staff member's profile data.
    /// </summary>
    public class GetStaffProfileResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid StaffId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool TwoFactorEnabled { get; set; }
        public bool ReceiveQuoteEmails { get; set; }
    }
    #endregion

    #region Handler
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the retrieval of a staff member's profile.
    /// </summary>
    public class GetStaffProfileQueryHandler : IRequestHandler<GetStaffProfileQuery, GetStaffProfileResponseDto>
    {
        private readonly IStaffAccountRepository _staffAccountRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Constructor for GetStaffProfileQueryHandler.
        /// </summary>
        public GetStaffProfileQueryHandler(
            IStaffAccountRepository staffAccountRepository,
            UserManager<ApplicationUser> userManager)
        {
            _staffAccountRepository = staffAccountRepository;
            _userManager = userManager;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Processes the GetStaffProfileQuery to fetch staff details.
        /// </summary>
        public async Task<GetStaffProfileResponseDto> Handle(GetStaffProfileQuery request, CancellationToken cancellationToken)
        {
            var staffAccounts = await _staffAccountRepository.GetAllAsync();
            var staff = staffAccounts.FirstOrDefault(s => s.IdentityUserId == request.UserId);
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());

            if (staff == null || user == null)
            {
                return new GetStaffProfileResponseDto
                {
                    Success = false,
                    Message = "Staff profile not found."
                };
            }

            var twoFactorEnabled = await _userManager.GetTwoFactorEnabledAsync(user);

            return new GetStaffProfileResponseDto
            {
                Success = true,
                StaffId = staff.StaffId,
                Email = staff.Email ?? string.Empty,
                FullName = staff.FullName ?? string.Empty,
                Role = staff.Role ?? string.Empty,
                TwoFactorEnabled = twoFactorEnabled,
                ReceiveQuoteEmails = staff.ReceiveQuoteEmails
            };
        }
    }
    #endregion
}
//---------------------END OF FILE------------------------------------------------------------------//
