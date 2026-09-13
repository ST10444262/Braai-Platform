using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;

namespace Inflame_Backend.Models.ProductCatalog
{
    /// <summary>
    /// Represents a fireplace product in the product catalog.
    /// </summary>
    [Table("fireplace_product")]
    public class FireplaceProduct : BaseModel
    {
        [PrimaryKey("product_id", false)]
        public Guid ProductId { get; set; }

        [Column("heat_output_kw")]
        public decimal HeatOutputKw { get; set; }

        [Column("fireplace_type")]
        public string FireplaceType { get; set; } = string.Empty;

        [Reference(typeof(Product))]
        public Product? BaseProduct { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//