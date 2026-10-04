using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using Inflame_Backend.Models.CustomBuild;
using Inflame_Backend.Models.ProductCatalog;
using System;

namespace Inflame_Backend.Models.CRM
{
    /// <summary>
    /// Represents an enquiry made by a client regarding a product or custom option.
    /// </summary>
    [Table("enquiry")]
    public class Enquiry : BaseModel
    {
        [PrimaryKey("enquiry_id", false)]
        public Guid EnquiryId { get; set; } = Guid.NewGuid();

        [Column("enquiry_type")]
        public string EnquiryType { get; set; } = string.Empty;

        [Column("first_name")]
        public string FirstName { get; set; } = string.Empty;

        [Column("last_name")]
        public string LastName { get; set; } = string.Empty;

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("phone")]
        public string Phone { get; set; } = string.Empty;

        [Column("product_id")]
        public Guid? ProductId { get; set; }

        [Reference(typeof(Product), includeInQuery: false)]
        public Product? Product { get; set; }

        [Column("custom_option_id")]
        public Guid? CustomOptionId { get; set; }

        [Reference(typeof(CustomOption), includeInQuery: false)]
        public CustomOption? CustomOption { get; set; }

        [Column("message")]
        public string Message { get; set; } = string.Empty;

        [Column("status")]
        public string Status { get; set; } = "New";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("client_id")]
        public Guid? ClientId { get; set; }

        [Reference(typeof(Client), includeInQuery: false)]
        public Client? Client { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//