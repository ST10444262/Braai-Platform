using Inflame_Backend.Data.Repositories.CRM;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Staff.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Command to update the preferences of a staff member.
    /// </summary>
    public record UpdateStaffPreferencesCommand(Guid UserId, bool ReceiveQuoteEmails) : IRequest<UpdateStaffPreferencesResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Response payload containing the result of the preferences update.
    /// </summary>
    public class UpdateStaffPreferencesResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the update of a staff member's preferences.
    /// </summary>
    public class UpdateStaffPreferencesCommandHandler : IRequestHandler<UpdateStaffPreferencesCommand, UpdateStaffPreferencesResponseDto>
    {
        private readonly IStaffAccountRepository _staffAccountRepository;

        //------------------------------------------------------------------------------------------//
        public UpdateStaffPreferencesCommandHandler(IStaffAccountRepository staffAccountRepository)
        {
            _staffAccountRepository = staffAccountRepository;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<UpdateStaffPreferencesResponseDto> Handle(UpdateStaffPreferencesCommand request, CancellationToken cancellationToken)
        {
            var staffAccounts = await _staffAccountRepository.GetAllAsync();
            var staff = staffAccounts.FirstOrDefault(s => s.IdentityUserId == request.UserId);

            if (staff == null)
            {
                return new UpdateStaffPreferencesResponseDto
                {
                    Success = false,
                    Message = "Staff profile not found."
                };
            }

            staff.ReceiveQuoteEmails = request.ReceiveQuoteEmails;
            staff.UpdatedAt = DateTime.UtcNow;

            await _staffAccountRepository.UpdateAsync(staff);

            return new UpdateStaffPreferencesResponseDto
            {
                Success = true,
                Message = "Preferences updated."
            };
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
