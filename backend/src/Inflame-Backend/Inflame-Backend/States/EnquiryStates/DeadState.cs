using System;

namespace Inflame_Backend.States.EnquiryStates
{
    public class DeadState : IEnquiryState
    {
        //------------------------------------------------------------------------------------------//
        public string Status => "Dead";

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. A dead lead cannot be reviewed.
        /// </summary>
        public void UnderReviewLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("A dead lead cannot be placed under review.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. A dead lead cannot be contacted.
        /// </summary>
        public void ContactedLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("A dead lead cannot be contacted.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. A dead lead cannot be converted.
        /// </summary>
        public void ConvertedLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("A dead lead cannot be converted.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. The lead is already dead.
        /// </summary>
        public void DeadLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("The lead is already dead.");
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
