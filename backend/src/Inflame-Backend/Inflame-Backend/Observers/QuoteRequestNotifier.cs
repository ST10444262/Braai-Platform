using System.Collections.Generic;

namespace Inflame_Backend.Observers
{
    public class QuoteRequestNotifier : IQuoteSubject
    {
        private readonly List<IQuoteObserver> _observers = new List<IQuoteObserver>();
        private string _latestQuoteDetails = string.Empty;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Attaches an observer to the subject.
        /// </summary>
        public void Attach(IQuoteObserver observer)
        {
            if (!_observers.Contains(observer))
            {
                _observers.Add(observer);
            }
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Detaches an observer from the subject.
        /// </summary>
        public void Detach(IQuoteObserver observer)
        {
            _observers.Remove(observer);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Notifies all attached observers of a new quote request.
        /// </summary>
        public void Notify()
        {
            foreach (var observer in _observers)
            {
                observer.Update(_latestQuoteDetails);
            }
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Triggered when a new quote is requested. Updates state and notifies observers.
        /// </summary>
        /// <param name="quoteDetails">Details of the requested quote.</param>
        public void NewQuoteRequested(string quoteDetails)
        {
            _latestQuoteDetails = quoteDetails;
            Notify();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
