using System;

namespace Inflame_Backend.Observers
{
    public class DatabaseLoggingObserver : IQuoteObserver
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Logs the lead in the PostgreSQL database for analytics when a quote is requested.
        /// </summary>
        /// <param name="quoteDetails">Details about the quote lead to process.</param>
        public void Update(string quoteDetails)
        {
            // Simulate logging to PostgreSQL database
            Console.WriteLine($"[Database Logger]: Logging quote lead to PostgreSQL database for analytics: {quoteDetails}");
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
