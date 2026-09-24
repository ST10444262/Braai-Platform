using System;

namespace Inflame_Backend.States.EnquiryStates
{
    public class UnderReviewState : IEnquiryState
    {
        //------------------------------------------------------------------------------------------//
        public string Status => "Under Review";

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. The lead is already under review.
        /// </summary>
        public void UnderReviewLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("The lead is already under review.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Transitions the lead to ContactedState once the review is complete and the client is contacted.
        /// </summary>
        public void ContactedLead(QuoteLeadManager context)
        {
            context.SetState(new ContactedState());
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. A lead must be contacted before it can be converted.
        /// </summary>
        public void ConvertedLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("Cannot convert a lead that is only under review. Must contact the client first.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Transitions the lead to DeadState if it is rejected during review.
        /// </summary>
        public void DeadLead(QuoteLeadManager context)
        {
            context.SetState(new DeadState());
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//