namespace Inflame_Backend.Observers
{
    public interface IProductSubject
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Attaches an observer to the subject.
        /// </summary>
        void Attach(IProductObserver observer);

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Detaches an observer from the subject.
        /// </summary>
        void Detach(IProductObserver observer);

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Notifies all attached observers of a state change 
        /// </summary>
        void Notify();
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
