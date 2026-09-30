using Inflame_Backend.Features.Product.Commands;
using Inflame_Backend.Features.Product.DTOs;
using Inflame_Backend.Features.Product.Queries;
using Inflame_Backend.Models.ProductCatalog;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inflame_Backend.Controllers.Admin
{
    /// <summary>
    /// API Controller for managing the Product Catalog from the Admin portal.
    /// </summary>
    [ApiController]
    [Route("api/admin/products")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public class ProductController : ControllerBase
    {
        private readonly IMediator _mediator;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the Admin ProductController with MediatR.
        /// </summary>
        public ProductController(IMediator mediator)
        {
            _mediator = mediator;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves a paginated and filtered catalog of products. Includes hidden/draft items.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] GetAdminProductQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Creates a new product and handles associated image uploads via FormData.
        /// Utilizes the ProductFactory for Braai and Fireplace subtypes.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CreateProductResponseDto>> CreateProduct([FromForm] CreateProductRequestDto request)
        {
            var command = new CreateProductCommand(request);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
