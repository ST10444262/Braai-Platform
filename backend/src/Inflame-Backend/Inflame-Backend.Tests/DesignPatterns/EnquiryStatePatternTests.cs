using System;
using FluentAssertions;
using Inflame_Backend.States;
using Inflame_Backend.States.EnquiryStates;
using Xunit;

namespace Inflame_Backend.Tests.DesignPatterns
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for the Enquiry State Pattern (QuoteLeadManager + concrete states).
    /// Verifies valid forward transitions succeed and that invalid backward/illegal
    /// transitions throw an InvalidOperationException.
    /// </summary>
    public class EnquiryStatePatternTests
    {
        //----------------------------------------------------------------------------------------------//
        #region Forward Transition Tests

        [Fact]
        public void NewLead_WhenMovedToUnderReview_ShouldTransitionCorrectly()
        {
            // Arrange
            var manager = new QuoteLeadManager();
            manager.GetStatus().Should().Be("New");

            // Act
            manager.UnderReviewLead();

            // Assert
            manager.GetStatus().Should().Be("Under Review",
                because: "New -> Under Review is a valid forward transition");
        }

        [Fact]
        public void UnderReviewLead_WhenMovedToContacted_ShouldTransitionCorrectly()
        {
            // Arrange
            var manager = new QuoteLeadManager();
            manager.UnderReviewLead(); // New -> UnderReview

            // Act
            manager.ContactedLead(); // UnderReview -> Contacted

            // Assert
            manager.GetStatus().Should().Be("Contacted",
                because: "UnderReview -> Contacted is a valid forward transition");
        }

        [Fact]
        public void ContactedLead_WhenMovedToConverted_ShouldTransitionCorrectly()
        {
            // Arrange
            var manager = new QuoteLeadManager();
            manager.UnderReviewLead();
            manager.ContactedLead();

            // Act
            manager.ConvertedLead(); // Contacted -> Converted

            // Assert
            manager.GetStatus().Should().Be("Converted",
                because: "Contacted -> Converted is a valid forward transition");
        }

        [Fact]
        public void NewLead_WhenMarkedDead_ShouldTransitionToDead()
        {
            // Arrange
            var manager = new QuoteLeadManager();

            // Act
            manager.DeadLead();

            // Assert
            manager.GetStatus().Should().Be("Dead",
                because: "New -> Dead is an allowed terminal transition");
        }

        [Fact]
        public void ContactedLead_WhenMarkedDead_ShouldTransitionToDead()
        {
            // Arrange
            var manager = new QuoteLeadManager();
            manager.UnderReviewLead();
            manager.ContactedLead();

            // Act
            manager.DeadLead();

            // Assert
            manager.GetStatus().Should().Be("Dead");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Invalid Backward Transition Tests (Crucial Guard Tests)

        [Fact]
        public void ConvertedLead_WhenMovedBackToNew_ShouldThrowInvalidOperationException()
        {
            // Arrange – advance to Converted
            var manager = new QuoteLeadManager();
            manager.UnderReviewLead();
            manager.ContactedLead();
            manager.ConvertedLead();
            manager.GetStatus().Should().Be("Converted");

            // Act – attempt illegal backward transition via UnderReviewLead()
            var act = () => manager.UnderReviewLead();

            // Assert
            act.Should().Throw<InvalidOperationException>(
                because: "a Converted lead must NOT be allowed to revert to UnderReview – " +
                         "this is the critical backward-transition guard");
        }

        [Fact]
        public void ConvertedLead_WhenContactedAgain_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var manager = new QuoteLeadManager();
            manager.UnderReviewLead();
            manager.ContactedLead();
            manager.ConvertedLead();

            // Act
            var act = () => manager.ContactedLead();

            // Assert
            act.Should().Throw<InvalidOperationException>(
                because: "a Converted lead cannot be moved backward to Contacted");
        }

        [Fact]
        public void ConvertedLead_WhenConvertedAgain_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var manager = new QuoteLeadManager();
            manager.UnderReviewLead();
            manager.ContactedLead();
            manager.ConvertedLead();

            // Act
            var act = () => manager.ConvertedLead();

            // Assert
            act.Should().Throw<InvalidOperationException>(
                because: "a lead that is already Converted cannot be Converted again");
        }

        [Fact]
        public void NewLead_WhenContactedDirectly_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var manager = new QuoteLeadManager();

            // Act – skipping the required UnderReview step
            var act = () => manager.ContactedLead();

            // Assert
            act.Should().Throw<InvalidOperationException>(
                because: "a New lead must be reviewed before it can be contacted");
        }

        [Fact]
        public void NewLead_WhenConvertedDirectly_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var manager = new QuoteLeadManager();

            // Act
            var act = () => manager.ConvertedLead();

            // Assert
            act.Should().Throw<InvalidOperationException>(
                because: "a New lead cannot be converted directly, skipping required states");
        }

        [Fact]
        public void DeadLead_AllTransitions_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var manager = new QuoteLeadManager();
            manager.DeadLead();

            // Act & Assert – a dead lead cannot transition to any other state
            ((Action)manager.UnderReviewLead).Should().Throw<InvalidOperationException>();
            ((Action)manager.ContactedLead).Should().Throw<InvalidOperationException>();
            ((Action)manager.ConvertedLead).Should().Throw<InvalidOperationException>();
            ((Action)manager.DeadLead).Should().Throw<InvalidOperationException>();
        }

        [Fact]
        public void ContactedLead_WhenMovedBackToUnderReview_ShouldThrowInvalidOperationException()
        {
            // Arrange
            var manager = new QuoteLeadManager();
            manager.UnderReviewLead();
            manager.ContactedLead();

            // Act
            var act = () => manager.UnderReviewLead();

            // Assert
            act.Should().Throw<InvalidOperationException>(
                because: "a Contacted lead cannot move backward to UnderReview");
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
