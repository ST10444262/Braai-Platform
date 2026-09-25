using System;

namespace Inflame_Backend.States.EnquiryStates
{
    public class ConvertedState : IEnquiryState
    {
        //------------------------------------------------------------------------------------------//
        public string Status => "Converted";

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. Cannot move backward to under review.
        /// </summary>
        public void UnderReviewLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("Cannot move a converted lead backward to under review.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. Cannot move backward to contacted.
        /// </summary>
        public void ContactedLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("Cannot move a converted lead backward to contacted.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. The lead is already converted.
        /// </summary>
        public void ConvertedLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("The lead is already converted.");
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Invalid transition. A converted lead cannot be marked as dead.
        /// </summary>
        public void DeadLead(QuoteLeadManager context)
        {
            throw new InvalidOperationException("A converted lead cannot be marked as dead.");
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//