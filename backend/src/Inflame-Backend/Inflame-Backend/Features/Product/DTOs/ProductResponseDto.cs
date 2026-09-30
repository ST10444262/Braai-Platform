using System;
using System.Collections.Generic;
using System.Linq;

namespace Inflame_Backend.Features.Product.DTOs
{
    //------------------------------------------------------------------------------------------//
    public class ProductResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string ProductType { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public bool IsImported { get; set; }
        public bool IsCustomisable { get; set; }
        public decimal Price { get; set; }
        public decimal? OnSpecial { get; set; }
        public string Description { get; set; } = string.Empty;
        public List<ProductImageResponseDto> Images { get; set; } = new();

        //------------------------------------------------------------------------------------------//
        public ProductResponseDto() { }

        //------------------------------------------------------------------------------------------//
        public ProductResponseDto(Inflame_Backend.Models.ProductCatalog.Product p)
        {
            Id = p.ProductId;
            Name = p.Name;
            Category = p.Category;
            ProductType = p.ProductType;
            Brand = p.Brand;
            IsImported = p.IsImported;
            IsCustomisable = p.IsCustomisable;
            Price = p.Price;
            OnSpecial = p.OnSpecial;
            Description = p.Description;
            Images = (p.Images ?? new List<Inflame_Backend.Models.ProductCatalog.ProductImage>())
                .Select(i => new ProductImageResponseDto { Url = i.Url, IsPrimary = i.IsPrimary })
                .ToList();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
