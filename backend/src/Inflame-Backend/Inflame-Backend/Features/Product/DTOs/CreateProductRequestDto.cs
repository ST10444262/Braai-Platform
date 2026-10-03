using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace Inflame_Backend.Features.Product.DTOs
{
    /// <summary>
    /// Payload for creating a new product.
    /// Supports base product fields and specific fields for Braai or Fireplace product types.
    /// </summary>
    public class CreateProductRequestDto
    {
        //------------------------------------------------------------------------------------------//
        // Base Product Properties
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string Brand { get; set; } = string.Empty;
        public bool IsImported { get; set; }
        public bool IsCustomisable { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal? OnSpecial { get; set; }
        public bool IsVisible { get; set; } = false;

        //------------------------------------------------------------------------------------------//
        public string ProductType { get; set; } = string.Empty;

        //------------------------------------------------------------------------------------------//
        // Braai Specific Properties
        public string? FuelType { get; set; }
        public string? BraaiType { get; set; }

        //------------------------------------------------------------------------------------------//
        // Fireplace Specific Properties
        public decimal? HeatOutputKw { get; set; }
        public string? FireplaceType { get; set; }

        //------------------------------------------------------------------------------------------//
        // Image Upload Properties
        public List<IFormFile>? Images { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
