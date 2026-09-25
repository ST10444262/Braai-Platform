using System;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Models.CRM;

namespace Inflame_Backend.Observers
{
    public class DatabaseLoggingObserver : IQuoteObserver, IProductObserver
    {
        private readonly IAnalyticsLogRepository _analyticsRepository;

        //------------------------------------------------------------------------------------------//
        public DatabaseLoggingObserver(IAnalyticsLogRepository analyticsRepository)
        {
            _analyticsRepository = analyticsRepository;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Logs the lead in the PostgreSQL database for analytics when a quote is requested.
        /// </summary>
        /// <param name="quoteDetails">Details about the quote lead to process.</param>
        public void Update(string quoteDetails)
        {
            var log = new AnalyticsLog
            {
                LogId = Guid.NewGuid(),
                Action = "Quote Requested",
                Details = quoteDetails,
                CreatedAt = DateTime.UtcNow
            };

            // Analytics log should not block the main thread unnecessarily
            _ = _analyticsRepository.AddAsync(log);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Logs product actions in the PostgreSQL database for analytics.
        /// </summary>
        /// <param name="action">The action performed (e.g., Product Created, Product Edited, Product Deleted).</param>
        /// <param name="productDetails">Details about the product involved.</param>
        public void Update(string action, string productDetails)
        {
            var log = new AnalyticsLog
            {
                LogId = Guid.NewGuid(),
                Action = action,
                Details = productDetails,
                CreatedAt = DateTime.UtcNow
            };

            // Analytics log should not block the main thread unnecessarily
            _ = _analyticsRepository.AddAsync(log);
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
