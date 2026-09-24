namespace Inflame_Backend.Observers
{
    public interface IQuoteSubject
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Attaches an observer to the subject.
        /// </summary>
        void Attach(IQuoteObserver observer);

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Detaches an observer from the subject.
        /// </summary>
        void Detach(IQuoteObserver observer);

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Notifies all attached observers of a state change 
        /// </summary>
        void Notify();
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
