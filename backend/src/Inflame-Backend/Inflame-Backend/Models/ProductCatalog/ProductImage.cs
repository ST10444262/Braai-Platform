using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;

namespace Inflame_Backend.Models.ProductCatalog
{
    /// <summary>
    /// Represents an image associated with a product in the product catalog.
    /// </summary>
    [Table("product_image")]
    public class ProductImage : BaseModel
    {
        [PrimaryKey("image_id", true)]
        public Guid ImageId { get; set; } = Guid.NewGuid();

        [Column("product_id")]
        public Guid ProductId { get; set; }

        [Column("url")]
        public string Url { get; set; } = string.Empty;

        [Column("is_primary")]
        public bool IsPrimary { get; set; }

        [Reference(typeof(Product), includeInQuery: false)]
        [Newtonsoft.Json.JsonIgnore]
        public Product? Product { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//