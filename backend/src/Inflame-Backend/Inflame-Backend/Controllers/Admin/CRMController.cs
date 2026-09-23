using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Admin
{
    /// <summary>
    /// Controller for managing CRM (Customer Relationship Management) functionalities, including actions for handling customer interactions, data management, and related operations.
    /// </summary>
    public class CRMController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//