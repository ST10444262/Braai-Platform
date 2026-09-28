using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Inflame_Backend.Observers;
using Inflame_Backend.States;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Models.CRM;

namespace Inflame_Backend.Features.Enquiries.Commands
{
    public class CreateQuoteCommandHandler : IRequestHandler<CreateQuoteCommand, string>
    {
        private readonly IEnquiryRepository _enquiryRepository;
        private readonly IAnalyticsLogRepository _analyticsRepository;

        //------------------------------------------------------------------------------------------//
        public CreateQuoteCommandHandler(IEnquiryRepository enquiryRepository, IAnalyticsLogRepository analyticsRepository)
        {
            _enquiryRepository = enquiryRepository;
            _analyticsRepository = analyticsRepository;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Handles the creation of a new quote request, triggering the Observer and State patterns,
        /// and saving the entity to the database via the Repository.
        /// </summary>
        public async Task<string> Handle(CreateQuoteCommand request, CancellationToken cancellationToken)
        {
            // Initialize State Pattern
            var stateManager = new QuoteLeadManager();
            string initialState = stateManager.GetStatus();

            // Setup Observer Pattern
            var notifier = new QuoteRequestNotifier();
            notifier.Attach(new EmailNotificationObserver());
            notifier.Attach(new DatabaseLoggingObserver(_analyticsRepository));

            // Trigger notifications
            string quoteDetails = $"Client: {request.FirstName} {request.LastName} ({request.Email}) | Initial Status: {initialState}";
            notifier.NewQuoteRequested(quoteDetails);

            // Map Command to model & Save to Repository
            var enquiry = new Enquiry
            {
                EnquiryId = Guid.NewGuid(),
                EnquiryType = "Quote",
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                ProductId = request.ProductId,
                Message = request.Message,
                Status = initialState,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _enquiryRepository.AddAsync(enquiry);

            return $"Quote successfully created for {request.FirstName} {request.LastName} with status: {initialState}";
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//