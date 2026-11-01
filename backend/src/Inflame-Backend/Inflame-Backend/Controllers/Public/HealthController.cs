using System;
using System.Threading;
using System.Threading.Tasks;
using Inflame_Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Public
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Controller to handle health check pings from UptimeRobot, load balancers, and post-deployment verifications.
    /// Verifies application lifecycle, database connectivity, and Redis cache availability.
    /// </summary>
    [ApiController]
    [Route("api/public/health")]
    public class HealthController : ControllerBase
    {
        #region Fields & Dependencies
        private readonly IDatabaseHealthChecker _healthChecker;
        #endregion

        #region Constructor
        public HealthController(IDatabaseHealthChecker healthChecker)
        {
            _healthChecker = healthChecker;
        }
        #endregion

        #region Handler Methods
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Health check endpoint that verifies service health, database connectivity, and Redis cache.
        /// Returns 200 OK when both the service, database, and Redis cache are operational.
        /// Returns 503 Service Unavailable if any dependency is unreachable.
        /// </summary>
        /// <returns>JSON object with health status, dependency states, and timestamp.</returns>
        [HttpGet]
        public async Task<IActionResult> Ping(CancellationToken cancellationToken)
        {
            try
            {
                var healthStatus = await _healthChecker.CheckComprehensiveHealthAsync(cancellationToken);

                if (!healthStatus.IsHealthy)
                {
                    return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                    {
                        status = "Unhealthy",
                        database = healthStatus.IsDatabaseConnected ? "Connected" : (healthStatus.DatabaseError ?? "Unreachable"),
                        redis = healthStatus.IsRedisConnected ? "Connected" : (healthStatus.RedisError ?? "Unreachable"),
                        timestamp = DateTime.UtcNow
                    });
                }

                return Ok(new
                {
                    status = "Healthy",
                    database = "Connected",
                    redis = "Connected",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    status = "Unhealthy",
                    database = "Error",
                    redis = "Error",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//