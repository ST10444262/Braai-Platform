using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Inflame_Backend.Controllers.Public;
using Inflame_Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace Inflame_Backend.Tests.Controllers
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for HealthController.
    /// Verifies that /api/public/health tests the database connection and returns appropriate status codes.
    /// </summary>
    public class HealthControllerTests
    {
        private readonly Mock<IDatabaseHealthChecker> _mockHealthChecker;
        private readonly HealthController _controller;

        public HealthControllerTests()
        {
            _mockHealthChecker = new Mock<IDatabaseHealthChecker>();
            _controller = new HealthController(_mockHealthChecker.Object);
        }

        //------------------------------------------------------------------------------------------//
        [Fact]
        public async Task Ping_WhenDatabaseReachable_Returns200OkWithConnectedStatus()
        {
            // Arrange
            _mockHealthChecker
                .Setup(h => h.CanConnectAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Ping(CancellationToken.None);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            // Verify payload
            var value = okResult.Value;
            value.Should().NotBeNull();
            var statusProp = value!.GetType().GetProperty("status")?.GetValue(value)?.ToString();
            var dbProp = value.GetType().GetProperty("database")?.GetValue(value)?.ToString();
            statusProp.Should().Be("Healthy");
            dbProp.Should().Be("Connected");
        }

        //------------------------------------------------------------------------------------------//
        [Fact]
        public async Task Ping_WhenDatabaseUnreachable_Returns503ServiceUnavailable()
        {
            // Arrange
            _mockHealthChecker
                .Setup(h => h.CanConnectAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Ping(CancellationToken.None);

            // Assert
            var objectResult = result as ObjectResult;
            objectResult.Should().NotBeNull();
            objectResult!.StatusCode.Should().Be(StatusCodes.Status503ServiceUnavailable);

            var value = objectResult.Value;
            value.Should().NotBeNull();
            var statusProp = value!.GetType().GetProperty("status")?.GetValue(value)?.ToString();
            var dbProp = value.GetType().GetProperty("database")?.GetValue(value)?.ToString();
            statusProp.Should().Be("Unhealthy");
            dbProp.Should().Be("Unreachable");
        }

        //------------------------------------------------------------------------------------------//
        [Fact]
        public async Task Ping_WhenDatabaseThrowsException_Returns503ServiceUnavailable()
        {
            // Arrange
            _mockHealthChecker
                .Setup(h => h.CanConnectAsync(It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Connection timeout"));

            // Act
            var result = await _controller.Ping(CancellationToken.None);

            // Assert
            var objectResult = result as ObjectResult;
            objectResult.Should().NotBeNull();
            objectResult!.StatusCode.Should().Be(StatusCodes.Status503ServiceUnavailable);

            var value = objectResult.Value;
            value.Should().NotBeNull();
            var statusProp = value!.GetType().GetProperty("status")?.GetValue(value)?.ToString();
            var dbProp = value.GetType().GetProperty("database")?.GetValue(value)?.ToString();
            statusProp.Should().Be("Unhealthy");
            dbProp.Should().Be("Error");
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
