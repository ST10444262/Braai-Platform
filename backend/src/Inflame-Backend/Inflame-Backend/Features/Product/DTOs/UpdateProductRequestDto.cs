using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Inflame_Backend.Features.Product.DTOs
{
    /// <summary>
    /// Payload for updating an existing product.
    /// </summary>
    public class UpdateProductRequestDto
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
        public bool IsVisible { get; set; }

        //------------------------------------------------------------------------------------------//
        // Braai Specific Properties (Optional)
        public string? FuelType { get; set; }
        public string? BraaiType { get; set; }

        //------------------------------------------------------------------------------------------//
        // Fireplace Specific Properties (Optional)
        public decimal? HeatOutputKw { get; set; }
        public string? FireplaceType { get; set; }

        //------------------------------------------------------------------------------------------//
        // Image Upload Properties
        public List<IFormFile>? Images { get; set; }
        public List<Guid>? ExistingImageIds { get; set; }
        public Guid? PrimaryImageId { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
