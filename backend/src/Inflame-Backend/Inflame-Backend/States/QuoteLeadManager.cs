using Inflame_Backend.States.EnquiryStates;

namespace Inflame_Backend.States
{
    public class QuoteLeadManager
    {
        #region Configuration
        private IEnquiryState _currentEnquiryState;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Default constructor for the QuoteLeadManager class. Initializes the current enquiry state to a new state.
        /// </summary>
        public QuoteLeadManager()
        {
            _currentEnquiryState = new NewState();
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Allows for the context to go to the next state.
        /// </summary>
        /// <param name="state"></param>
        public void SetState(IEnquiryState state)
        {
            _currentEnquiryState = state;
        }

        #endregion

        //------------------------------------------------------------------------------------------//
        #region Enquiry/Lead State Management

        /// <summary>
        /// Attempts to mark the lead as under review. The actual logic is handled by the current state.
        /// </summary>
        public void UnderReviewLead()
        {
            _currentEnquiryState.UnderReviewLead(this);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Attempts to mark the lead as contacted. The actual logic is handled by the current state.
        /// </summary>
        public void ContactedLead()
        {
            _currentEnquiryState.ContactedLead(this);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Attempts to mark the lead as converted. The actual logic is handled by the current state.
        /// </summary>
        public void ConvertedLead()
        {
            _currentEnquiryState.ConvertedLead(this);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Attempts to mark the lead as dead. The actual logic is handled by the current state.
        /// </summary>
        public void DeadLead()
        {
            _currentEnquiryState.DeadLead(this);
        }

        #endregion

    }
}

//---------------------END OF FILE------------------------------------------------------------------//
