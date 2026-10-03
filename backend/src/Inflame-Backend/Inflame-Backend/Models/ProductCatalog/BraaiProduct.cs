using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;

namespace Inflame_Backend.Models.ProductCatalog
{
    /// <summary>
    /// Represents a braai product in the product catalog.
    /// </summary>
    [Table("braai_product")]
    public class BraaiProduct : BaseModel
    {
        [PrimaryKey("product_id", false)]
        public Guid ProductId { get; set; }

        [Column("fuel_type")]
        public string FuelType { get; set; } = string.Empty;

        [Column("braai_type")]
        public string BraaiType { get; set; } = string.Empty;

        [Reference(typeof(Product), includeInQuery: false)]
        public Product? BaseProduct { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//