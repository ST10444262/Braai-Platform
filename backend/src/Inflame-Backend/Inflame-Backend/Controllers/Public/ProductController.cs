using Inflame_Backend.Features.Product.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Public
{
    [ApiController]
    [Route("api/products")]
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
            [FromQuery] string? category,
            [FromQuery] string? brand,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var query = new GetProductQuery
            {
                Category = category,
                Brand = brand,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                PageNumber = Math.Max(page, 1),
                PageSize = Math.Clamp(pageSize, 1, 100)
            };

            var products = await _mediator.Send(query, ct);

            return Ok(products.Where(p => p.IsVisible).Select(p => new ProductResponseDto(p)));
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

    //------------------------------------------------------------------------------------------//
    public class ProductResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public bool IsImported { get; set; }
        public bool IsCustomisable { get; set; }
        public decimal Price { get; set; }
        public decimal? OnSpecial { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<ProductImageResponseDto> Images { get; set; } = new();

        public ProductResponseDto() { }

        public ProductResponseDto(Inflame_Backend.Models.ProductCatalog.Product p)
        {
            Id = p.ProductId;
            Name = p.Name;
            Category = p.Category;
            Brand = p.Brand;
            IsImported = p.IsImported;
            IsCustomisable = p.IsCustomisable;
            Price = p.Price;
            OnSpecial = p.OnSpecial;
            Description = p.Description;
            Images = (p.Images ?? new())
                .Select(i => new ProductImageResponseDto { Url = i.Url, IsPrimary = i.IsPrimary })
                .ToList();
        }
    }

    public class ProductImageResponseDto
    {
        public string Url { get; set; } = string.Empty;
        public bool IsPrimary { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//