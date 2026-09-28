using System;
using System.Linq;
using Inflame_Backend.Services;
using Inflame_Backend.Data.Repositories.CRM;

namespace Inflame_Backend.Observers
{
    public class EmailNotificationObserver : IQuoteObserver
    {
        private readonly IEmailService _emailService;
        private readonly IStaffAccountRepository _staffAccountRepository;

        //------------------------------------------------------------------------------------------//
        public EmailNotificationObserver(IEmailService emailService, IStaffAccountRepository staffAccountRepository)
        {
            _emailService = emailService;
            _staffAccountRepository = staffAccountRepository;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Sends an email notification to staff when a new quote lead is requested.
        /// </summary>
        /// <param name="quoteDetails">Details about the quote lead to process.</param>
        public async void Update(string quoteDetails)
        {
            try
            {
                // Gets all staff members
                var staffMembers = await _staffAccountRepository.GetAllAsync();
                // Filters out staff that have not opted in to receive quote emails or are not active
                var subscribedStaff = staffMembers.Where(s => s.ReceiveQuoteEmails && s.IsActive).ToList();

                // Sends an email to each subscribed staff member
                foreach (var staff in subscribedStaff)
                {
                    if (!string.IsNullOrEmpty(staff.Email))
                    {
                        var subject = "New Quote Request Received";
                        var body = $"<p>A new quote has been requested.</p><p><strong>Details:</strong></p><p>{quoteDetails}</p>";
                        await _emailService.SendEmailAsync(staff.Email, subject, body);
                    }
                }
            }
            catch (Exception ex)
            {
                
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//