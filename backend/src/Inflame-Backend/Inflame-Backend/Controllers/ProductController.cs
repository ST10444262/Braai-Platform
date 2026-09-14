using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers
{
    public class ProductController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//