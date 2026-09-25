using System.Collections.Generic;

namespace Inflame_Backend.Observers
{
    public class ProductActionNotifier : IProductSubject
    {
        private readonly List<IProductObserver> _observers = new List<IProductObserver>();
        private string _latestAction = string.Empty;
        private string _latestProductDetails = string.Empty;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Attaches an observer to the subject.
        /// </summary>
        public void Attach(IProductObserver observer)
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
        public void Detach(IProductObserver observer)
        {
            _observers.Remove(observer);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Notifies all attached observers of a product action.
        /// </summary>
        public void Notify()
        {
            foreach (var observer in _observers)
            {
                observer.Update(_latestAction, _latestProductDetails);
            }
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Triggered when a product is created, edited, or deleted. Notifies observers.
        /// </summary>
        /// <param name="action">The action performed (e.g., Created, Edited, Deleted).</param>
        /// <param name="productDetails">Details of the product.</param>
        public void ProductActionOccurred(string action, string productDetails)
        {
            _latestAction = action;
            _latestProductDetails = productDetails;
            Notify();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
