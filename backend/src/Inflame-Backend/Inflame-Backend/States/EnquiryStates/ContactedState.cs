using System;

namespace Inflame_Backend.States.EnquiryStates
{
    public class ContactedState : IEnquiryState
    {
        //------------------------------------------------------------------------------------------//
        public string Status => "Contacted";

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. Cannot move backward to under review.
        /// </summary>
        public void UnderReviewLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("Cannot move a contacted lead backward to under review.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. The lead has already been contacted.
        /// </summary>
        public void ContactedLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("The lead has already been contacted.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Transitions the lead to ConvertedState when the client accepts the quote.
        /// </summary>
        public void ConvertedLead(QuoteLeadManager context)
        {
            context.SetState(new ConvertedState());
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Transitions the lead to DeadState if the client declines or is unresponsive.
        /// </summary>
        public void DeadLead(QuoteLeadManager context)
        {
            context.SetState(new DeadState());
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//