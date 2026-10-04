using MediatR;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Data.Repositories.CustomBuild;
using Inflame_Backend.Models.CRM;
using Inflame_Backend.Models.CustomBuild;
using Inflame_Backend.Observers;
using Inflame_Backend.States;
using Inflame_Backend.Services;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.CustomBuild.Commands
{
    public class CreateCustomBuildCommandHandler : IRequestHandler<CreateCustomBuildCommand, Guid>
    {
        private readonly ICustomOptionRepository _customOptionRepository;
        private readonly IEnquiryRepository _enquiryRepository;
        private readonly IAnalyticsLogRepository _analyticsRepository;
        private readonly IEmailService _emailService;
        private readonly IStaffAccountRepository _staffAccountRepository;

        //------------------------------------------------------------------------------------------//
        public CreateCustomBuildCommandHandler(
            ICustomOptionRepository customOptionRepository,
            IEnquiryRepository enquiryRepository,
            IAnalyticsLogRepository analyticsRepository,
            IEmailService emailService,
            IStaffAccountRepository staffAccountRepository)
        {
            _customOptionRepository = customOptionRepository;
            _enquiryRepository = enquiryRepository;
            _analyticsRepository = analyticsRepository;
            _emailService = emailService;
            _staffAccountRepository = staffAccountRepository;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<Guid> Handle(CreateCustomBuildCommand request, CancellationToken cancellationToken)
        {
            var data = request.RequestData;

            // Create the Custom Option entity containing the technical specs
            var customOption = new CustomOption
            {
                CustomOptionId = Guid.NewGuid(),
                OptionType = data.OptionType,
                WidthMm = data.WidthMm,
                HeightMm = data.HeightMm,
                DepthMm = data.DepthMm,
                Material = "Standard",
                StyleOption = "Standard"
            };

            var insertedOption = await _customOptionRepository.AddAsync(customOption);
            
            // Initialize State Pattern
            var stateManager = new QuoteLeadManager();
            string initialState = stateManager.GetStatus();

            // Setup Observer Pattern
            var notifier = new QuoteRequestNotifier();
            notifier.Attach(new EmailNotificationObserver(_emailService, _staffAccountRepository));
            notifier.Attach(new DatabaseLoggingObserver(_analyticsRepository));

            // Trigger notifications
            string buildDetails = $"Client: {data.FirstName} {data.LastName} ({data.Email}) | Custom Build: {data.OptionType} | Initial Status: {initialState}";
            notifier.NewQuoteRequested(buildDetails);

            // Create the Enquiry entity linking back to the Custom Option using the DB-generated ID
            var enquiry = new Enquiry
            {
                EnquiryId = Guid.NewGuid(),
                EnquiryType = "Custom Build",
                CustomOptionId = insertedOption.CustomOptionId,
                FirstName = data.FirstName,
                LastName = data.LastName,
                Email = data.Email,
                Phone = data.Phone,
                Status = initialState,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Message = $"Custom Build Request for {data.OptionType}. Dimensions: W:{data.WidthMm}mm H:{data.HeightMm}mm D:{data.DepthMm}mm."
            };

            var insertedEnquiry = await _enquiryRepository.AddAsync(enquiry);

            return insertedEnquiry.EnquiryId;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
