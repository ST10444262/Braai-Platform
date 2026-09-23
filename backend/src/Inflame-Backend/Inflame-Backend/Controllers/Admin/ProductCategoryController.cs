using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Admin
{
    /// <summary>
    /// Controller for managing product categories, including actions for listing, creating, updating, and deleting products.
    /// </summary>
    public class ProductCategoryController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//