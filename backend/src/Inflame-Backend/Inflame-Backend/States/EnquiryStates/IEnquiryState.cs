using Inflame_Backend.Observers;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace Inflame_Backend.States.EnquiryStates
{
    /// <summary>
    /// Interface for the Quote States
    /// </summary>
    public interface IEnquiryState
    {
        void NewLead(QuoteLeadManager context);
        void UnderReviewLead(QuoteLeadManager context);
        void ContactedLead(QuoteLeadManager context);
        void ConvertedLead(QuoteLeadManager context);
        void DeadLead(QuoteLeadManager context);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//