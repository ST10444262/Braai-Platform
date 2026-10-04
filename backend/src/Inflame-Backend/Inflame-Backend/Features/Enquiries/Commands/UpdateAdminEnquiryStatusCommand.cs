using MediatR;
using Inflame_Backend.Features.Enquiries.DTOs;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.States;
using Inflame_Backend.States.EnquiryStates;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Enquiries.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Command to update the status of an enquiry.
    /// </summary>
    public record UpdateEnquiryStatusCommand(Guid EnquiryId, string Status) : IRequest<UpdateEnquiryStatusResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the command to update the status of an enquiry in the database.
    /// </summary>
    public class UpdateEnquiryStatusCommandHandler : IRequestHandler<UpdateEnquiryStatusCommand, UpdateEnquiryStatusResponseDto>
    {
        private readonly IEnquiryRepository _enquiryRepository;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the handler with the enquiry repository dependency.
        /// </summary>
        public UpdateEnquiryStatusCommandHandler(IEnquiryRepository enquiryRepository)
        {
            _enquiryRepository = enquiryRepository;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Validates the enquiry ID and securely updates the status utilizing QuoteLeadManager constraints.
        /// </summary>
        public async Task<UpdateEnquiryStatusResponseDto> Handle(UpdateEnquiryStatusCommand request, CancellationToken cancellationToken)
        {
            var enquiry = await _enquiryRepository.GetByIdAsync(request.EnquiryId);

            if (enquiry == null)
            {
                return new UpdateEnquiryStatusResponseDto
                {
                    Success = false,
                    Message = "Enquiry not found."
                };
            }

            var manager = new QuoteLeadManager();
            manager.SetState(GetStateFromString(enquiry.Status));

            try
            {
                switch (request.Status)
                {
                    case "Under Review":
                        manager.UnderReviewLead();
                        break;
                    case "Contacted":
                        manager.ContactedLead();
                        break;
                    case "Converted":
                        manager.ConvertedLead();
                        break;
                    case "Dead":
                        manager.DeadLead();
                        break;
                    default:
                        return new UpdateEnquiryStatusResponseDto
                        {
                            Success = false,
                            Message = $"Invalid target status: {request.Status}"
                        };
                }
            }
            catch (InvalidOperationException ex)
            {
                return new UpdateEnquiryStatusResponseDto
                {
                    Success = false,
                    Message = ex.Message
                };
            }

            enquiry.Status = manager.GetStatus();
            enquiry.UpdatedAt = DateTime.UtcNow;

            await _enquiryRepository.UpdateAsync(enquiry);

            return new UpdateEnquiryStatusResponseDto
            {
                Success = true,
                Message = "Enquiry status updated successfully."
            };
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Maps a string status from the database into the corresponding IEnquiryState object.
        /// </summary>
        private IEnquiryState GetStateFromString(string status)
        {
            return status switch
            {
                "New" => new NewState(),
                "Under Review" => new UnderReviewState(),
                "Contacted" => new ContactedState(),
                "Converted" => new ConvertedState(),
                "Dead" => new DeadState(),
                _ => new NewState()
            };
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
