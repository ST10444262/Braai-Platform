using System;
using System.Threading;
using System.Threading.Tasks;
using Inflame_Backend.Data.Context;
using Inflame_Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Public
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Controller to handle health check pings from UptimeRobot, load balancers, and post-deployment verifications.
    /// Verifies application lifecycle and database connectivity.
    /// </summary>
    [ApiController]
    [Route("api/public/health")]
    public class HealthController : ControllerBase
    {
        private readonly IDatabaseHealthChecker _healthChecker;

        public HealthController(IDatabaseHealthChecker healthChecker)
        {
            _healthChecker = healthChecker;
        }

        #region Handler Methods
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Health check endpoint that verifies service health and database connectivity.
        /// Returns 200 OK when both the service and the database are operational.
        /// Returns 503 Service Unavailable if the database cannot be reached.
        /// </summary>
        /// <returns>JSON object with health status, database state, and timestamp.</returns>
        [HttpGet]
        public async Task<IActionResult> Ping(CancellationToken cancellationToken)
        {
            try
            {
                var isConnected = await _healthChecker.CanConnectAsync(cancellationToken);

                if (!isConnected)
                {
                    return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                    {
                        status = "Unhealthy",
                        database = "Unreachable",
                        timestamp = DateTime.UtcNow
                    });
                }

                return Ok(new
                {
                    status = "Healthy",
                    database = "Connected",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    status = "Unhealthy",
                    database = "Error",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
