using System;

namespace Inflame_Backend.States.EnquiryStates
{
    public class NewState : IEnquiryState
    {
        //------------------------------------------------------------------------------------------//
        public string Status => "New";

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Transitions the lead to UnderReviewState.
        /// </summary>
        public void UnderReviewLead(QuoteLeadManager context)
        {
            context.SetState(new UnderReviewState());
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. A new lead must be reviewed before it can be contacted.
        /// </summary>
        public void ContactedLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("Cannot contact a new lead. It must be under review first.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. A new lead cannot be converted directly.
        /// </summary>
        public void ConvertedLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("Cannot convert a new lead directly.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Transitions the lead to DeadState if it is no longer valid or canceled early.
        /// </summary>
        public void DeadLead(QuoteLeadManager context)
        {
            context.SetState(new DeadState());
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//