using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Public
{
    /// <summary>
    /// Controller for managing custom builds, including actions for creating, viewing, and managing custom build configurations.
    /// </summary>
    [ApiController]
    [Route("api/public/customBuilds")]
    public class CustomBuildController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//