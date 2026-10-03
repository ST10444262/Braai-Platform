using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Public
{
    /// <summary>
    /// Controller to handle health check pings, e.g., from UptimeRobot to keep the instance alive.
    /// </summary>
    [ApiController]
    [Route("api/public/health")]
    public class HealthController : ControllerBase
    {
        #region Handler Methods
        //------------------------------------------------------------------------------------------//
        
        /// <summary>
        /// Simple health check endpoint that returns 200 OK.
        /// Used by services like UptimeRobot to prevent the free tier container from sleeping.
        /// </summary>
        /// <returns>A string indicating the service is healthy.</returns>
        [HttpGet]
        public IActionResult Ping()
        {
            return Ok("Healthy");
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
