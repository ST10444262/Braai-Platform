using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Models.CRM;
using Inflame_Backend.Observers;
using Inflame_Backend.Services;
using Moq;
using Xunit;

namespace Inflame_Backend.Tests.DesignPatterns
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for the Observer Pattern (QuoteRequestNotifier + EmailNotificationObserver).
    /// Verifies that when a new quote is published, the EmailNotificationObserver is triggered
    /// and that the actual SMTP client is never called (the IEmailService is mocked).
    /// </summary>
    public class ObserverPatternTests
    {
        //----------------------------------------------------------------------------------------------//
        #region QuoteRequestNotifier (Subject) Tests

        [Fact]
        public void Attach_ThenNotify_ShouldCallObserverUpdate()
        {
            // Arrange
            var notifier = new QuoteRequestNotifier();
            var mockObserver = new Mock<IQuoteObserver>();
            notifier.Attach(mockObserver.Object);

            // Act
            notifier.NewQuoteRequested("Quote for 1x Braai Master");

            // Assert
            mockObserver.Verify(
                o => o.Update("Quote for 1x Braai Master"),
                Times.Once,
                because: "a single attached observer must receive exactly one Update call when notified");
        }

        [Fact]
        public void Attach_MultipleObservers_ShouldNotifyAll()
        {
            // Arrange
            var notifier = new QuoteRequestNotifier();
            var mockObserverA = new Mock<IQuoteObserver>();
            var mockObserverB = new Mock<IQuoteObserver>();

            notifier.Attach(mockObserverA.Object);
            notifier.Attach(mockObserverB.Object);

            // Act
            notifier.NewQuoteRequested("Bulk order quote");

            // Assert
            mockObserverA.Verify(o => o.Update("Bulk order quote"), Times.Once);
            mockObserverB.Verify(o => o.Update("Bulk order quote"), Times.Once);
        }

        [Fact]
        public void Detach_AfterDetaching_ShouldNotCallObserver()
        {
            // Arrange
            var notifier = new QuoteRequestNotifier();
            var mockObserver = new Mock<IQuoteObserver>();

            notifier.Attach(mockObserver.Object);
            notifier.Detach(mockObserver.Object);

            // Act
            notifier.NewQuoteRequested("Should not arrive");

            // Assert
            mockObserver.Verify(o => o.Update(It.IsAny<string>()), Times.Never,
                because: "a detached observer must never receive notifications");
        }

        [Fact]
        public void Attach_SameTwice_ShouldOnlyCallUpdateOnce()
        {
            // Arrange – duplicate registration guard
            var notifier = new QuoteRequestNotifier();
            var mockObserver = new Mock<IQuoteObserver>();

            notifier.Attach(mockObserver.Object);
            notifier.Attach(mockObserver.Object); // duplicate

            // Act
            notifier.NewQuoteRequested("Test");

            // Assert
            mockObserver.Verify(o => o.Update("Test"), Times.Once,
                because: "the notifier must deduplicate observer registrations");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region EmailNotificationObserver Tests (Mock SMTP so no real emails are sent)

        [Fact]
        public async Task EmailObserver_WhenNewQuotePublished_ShouldCallSendEmailWithSubscribedStaff()
        {
            // Arrange
            var mockEmailService = new Mock<IEmailService>();
            var mockStaffRepo = new Mock<IStaffAccountRepository>();

            // Two active staff members opted-in for quote emails
            var staff = new List<StaffAccount>
            {
                new StaffAccount { StaffId = Guid.NewGuid(), Email = "alice@inflame.co.za", IsActive = true,  ReceiveQuoteEmails = true  },
                new StaffAccount { StaffId = Guid.NewGuid(), Email = "bob@inflame.co.za",   IsActive = true,  ReceiveQuoteEmails = true  },
                new StaffAccount { StaffId = Guid.NewGuid(), Email = "charlie@inflame.co.za",IsActive = false, ReceiveQuoteEmails = true  }, // inactive – excluded
                new StaffAccount { StaffId = Guid.NewGuid(), Email = "dave@inflame.co.za",  IsActive = true,  ReceiveQuoteEmails = false }, // opted-out – excluded
            };

            mockStaffRepo
                .Setup(r => r.GetAllAsync())
                .ReturnsAsync(staff);

            mockEmailService
                .Setup(e => e.SendEmailAsync(
                    It.IsAny<IEnumerable<string>>(),
                    It.IsAny<string>(),
                    It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            var observer = new EmailNotificationObserver(mockEmailService.Object, mockStaffRepo.Object);

            // Attach observer to the notifier (integration of the full observer chain)
            var notifier = new QuoteRequestNotifier();
            notifier.Attach(observer);

            // Act
            notifier.NewQuoteRequested("Quote: 2x Braai Pro 500 @ R3000 each");

            // Allow the async void Update to complete
            await Task.Delay(200);

            // Assert – real SMTP never called; our mock was called once with only the two eligible staff
            mockEmailService.Verify(
                e => e.SendEmailAsync(
                    It.Is<IEnumerable<string>>(list =>
                        new List<string>(list).Contains("alice@inflame.co.za") &&
                        new List<string>(list).Contains("bob@inflame.co.za") &&
                        !new List<string>(list).Contains("charlie@inflame.co.za") &&
                        !new List<string>(list).Contains("dave@inflame.co.za")),
                    "New Quote Request Received",
                    It.IsAny<string>()),
                Times.Once,
                because: "only active, opted-in staff should receive the notification email via BCC");
        }

        [Fact]
        public async Task EmailObserver_WhenNoSubscribedStaffExist_ShouldNotCallSendEmail()
        {
            // Arrange – all staff are opted-out or inactive
            var mockEmailService = new Mock<IEmailService>();
            var mockStaffRepo = new Mock<IStaffAccountRepository>();

            var staff = new List<StaffAccount>
            {
                new StaffAccount { StaffId = Guid.NewGuid(), Email = "only@inflame.co.za", IsActive = false, ReceiveQuoteEmails = true },
            };

            mockStaffRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(staff);

            var observer = new EmailNotificationObserver(mockEmailService.Object, mockStaffRepo.Object);
            var notifier = new QuoteRequestNotifier();
            notifier.Attach(observer);

            // Act
            notifier.NewQuoteRequested("Some quote details");
            await Task.Delay(200);

            // Assert – no eligible recipients means no email should be sent
            mockEmailService.Verify(
                e => e.SendEmailAsync(
                    It.IsAny<IEnumerable<string>>(),
                    It.IsAny<string>(),
                    It.IsAny<string>()),
                Times.Never,
                because: "if no staff members are eligible, SendEmailAsync must never be called");
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
