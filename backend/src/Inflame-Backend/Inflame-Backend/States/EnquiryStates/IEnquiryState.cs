using Inflame_Backend.Observers;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace Inflame_Backend.States.EnquiryStates
{
    /// <summary>
    /// Interface for the Quote States
    /// </summary>
    public interface IEnquiryState
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Gets the string representation of the current state status.
        /// </summary>
        string Status { get; }
       
        //------------------------------------------------------------------------------------------//
        void UnderReviewLead(QuoteLeadManager context);

        //------------------------------------------------------------------------------------------//
        void ContactedLead(QuoteLeadManager context);

        //------------------------------------------------------------------------------------------//
        void ConvertedLead(QuoteLeadManager context);

        //------------------------------------------------------------------------------------------//
        void DeadLead(QuoteLeadManager context);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//