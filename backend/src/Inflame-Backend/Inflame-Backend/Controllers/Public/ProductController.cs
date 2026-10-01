using Inflame_Backend.Features.Product.Queries;
using Inflame_Backend.Features.Product.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Controllers.Public
{
    [ApiController]
    [Route("api/public/products")]
    public class ProductController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProductController(IMediator mediator)
        {
            _mediator = mediator;
        }

        //------------------------------------------------------------------------------------------//
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetProducts(
            [FromQuery] GetProductQuery query,
            CancellationToken ct = default)
        {
            // The query handles all filters and pagination natively.
            var products = await _mediator.Send(query, ct);

            return Ok(products.Select(p => new ProductResponseDto(p)));
        }

        //------------------------------------------------------------------------------------------//
 
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ProductResponseDto>> GetProduct(Guid id, CancellationToken ct)
        {
            var products = await _mediator.Send(new GetProductQuery { ProductId = id }, ct);
            var product = products.FirstOrDefault(p => p.IsVisible);

            return product == null ? NotFound() : Ok(new ProductResponseDto(product));
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//