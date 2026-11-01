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
    /// Verifies that /api/public/health tests both database and Redis connectivity, returning appropriate status codes.
    /// </summary>
    public class HealthControllerTests
    {
        #region Fields & Setup
        private readonly Mock<IDatabaseHealthChecker> _mockHealthChecker;
        private readonly HealthController _controller;

        public HealthControllerTests()
        {
            _mockHealthChecker = new Mock<IDatabaseHealthChecker>();
            _controller = new HealthController(_mockHealthChecker.Object);
        }
        #endregion

        #region Test Methods
        //------------------------------------------------------------------------------------------//
        [Fact]
        public async Task Ping_WhenDatabaseAndRedisReachable_Returns200OkWithConnectedStatus()
        {
            // Arrange
            _mockHealthChecker
                .Setup(h => h.CheckComprehensiveHealthAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new SystemHealthStatus
                {
                    IsDatabaseConnected = true,
                    IsRedisConnected = true
                });

            // Act
            var result = await _controller.Ping(CancellationToken.None);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.StatusCode.Should().Be(StatusCodes.Status200OK);

            var value = okResult.Value;
            value.Should().NotBeNull();
            var statusProp = value!.GetType().GetProperty("status")?.GetValue(value)?.ToString();
            var dbProp = value.GetType().GetProperty("database")?.GetValue(value)?.ToString();
            var redisProp = value.GetType().GetProperty("redis")?.GetValue(value)?.ToString();

            statusProp.Should().Be("Healthy");
            dbProp.Should().Be("Connected");
            redisProp.Should().Be("Connected");
        }

        //------------------------------------------------------------------------------------------//
        [Fact]
        public async Task Ping_WhenDatabaseUnreachable_Returns503ServiceUnavailable()
        {
            // Arrange
            _mockHealthChecker
                .Setup(h => h.CheckComprehensiveHealthAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new SystemHealthStatus
                {
                    IsDatabaseConnected = false,
                    IsRedisConnected = true,
                    DatabaseError = "Cannot connect to PostgreSQL"
                });

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
            var redisProp = value.GetType().GetProperty("redis")?.GetValue(value)?.ToString();

            statusProp.Should().Be("Unhealthy");
            dbProp.Should().Be("Cannot connect to PostgreSQL");
            redisProp.Should().Be("Connected");
        }

        //------------------------------------------------------------------------------------------//
        [Fact]
        public async Task Ping_WhenRedisUnreachable_Returns503ServiceUnavailable()
        {
            // Arrange
            _mockHealthChecker
                .Setup(h => h.CheckComprehensiveHealthAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new SystemHealthStatus
                {
                    IsDatabaseConnected = true,
                    IsRedisConnected = false,
                    RedisError = "Upstash connection refused"
                });

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
            var redisProp = value.GetType().GetProperty("redis")?.GetValue(value)?.ToString();

            statusProp.Should().Be("Unhealthy");
            dbProp.Should().Be("Connected");
            redisProp.Should().Be("Upstash connection refused");
        }

        //------------------------------------------------------------------------------------------//
        [Fact]
        public async Task Ping_WhenCheckerThrowsException_Returns503ServiceUnavailable()
        {
            // Arrange
            _mockHealthChecker
                .Setup(h => h.CheckComprehensiveHealthAsync(It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Unexpected dependency failure"));

            // Act
            var result = await _controller.Ping(CancellationToken.None);

            // Assert
            var objectResult = result as ObjectResult;
            objectResult.Should().NotBeNull();
            objectResult!.StatusCode.Should().Be(StatusCodes.Status503ServiceUnavailable);

            var value = objectResult.Value;
            value.Should().NotBeNull();
            var statusProp = value!.GetType().GetProperty("status")?.GetValue(value)?.ToString();
            var errorProp = value.GetType().GetProperty("error")?.GetValue(value)?.ToString();

            statusProp.Should().Be("Unhealthy");
            errorProp.Should().Be("Unexpected dependency failure");
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//