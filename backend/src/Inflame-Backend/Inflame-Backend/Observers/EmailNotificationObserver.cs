using System;

namespace Inflame_Backend.Observers
{
    public class EmailNotificationObserver : IQuoteObserver
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Sends an email notification to staff when a new quote lead is requested.
        /// </summary>
        /// <param name="quoteDetails">Details about the quote lead to process.</param>
        public void Update(string quoteDetails)
        {
            
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//