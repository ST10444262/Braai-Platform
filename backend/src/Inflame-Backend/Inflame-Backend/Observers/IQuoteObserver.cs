namespace Inflame_Backend.Observers
{
    public interface IQuoteObserver
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Update method called by the subject when a new quote is requested.
        /// </summary>
        /// <param name="quoteDetails">Details about the quote lead to process.</param>
        void Update(string quoteDetails);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//