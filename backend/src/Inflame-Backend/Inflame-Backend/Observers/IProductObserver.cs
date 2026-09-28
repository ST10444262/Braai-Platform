namespace Inflame_Backend.Observers
{
    public interface IProductObserver
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Update method called by the subject when a product action occurs.
        /// </summary>
        /// <param name="action">The action performed (e.g., Created, Edited, Deleted).</param>
        /// <param name="productDetails">Details about the product.</param>
        void Update(string action, string productDetails);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
