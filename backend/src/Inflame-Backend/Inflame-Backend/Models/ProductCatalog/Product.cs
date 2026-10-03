using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;

namespace Inflame_Backend.Models.ProductCatalog
{
    /// <summary>
    /// Represents a product in the product catalog.
    /// </summary>
    [Table("product")]
    public class Product : BaseModel
    {
        [PrimaryKey("product_id", false)]
        public Guid ProductId { get; set; } = Guid.NewGuid();

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("category")]
        public string Category { get; set; } = string.Empty;

        [Column("product_type")]
        public string ProductType { get; set; } = string.Empty;

        [Column("brand")]
        public string Brand { get; set; } = string.Empty;

        [Column("is_imported")]
        public bool IsImported { get; set; }

        [Column("is_customisable")]
        public bool IsCustomisable { get; set; }
        
        [Column("price")]
        public decimal Price { get; set; }

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("on_special")]
        public decimal? OnSpecial { get; set; }

        [Column("is_visible")]
        public bool IsVisible { get; set; } = true;

        [Reference(typeof(ProductImage), includeInQuery: false)]
        public List<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
}
//---------------------END OF FILE------------------------------------------------------------------//