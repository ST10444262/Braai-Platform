using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;

namespace Inflame_Backend.Models.CRM
{
    /// <summary>
    /// Represents an invoice record in the CRM system.
    /// </summary>
    [Table("invoice_record")]
    public class InvoiceRecord : BaseModel
    {
        [PrimaryKey("invoice_id", false)]
        public Guid InvoiceId { get; set; } = Guid.NewGuid();

        [Column("file_name")]
        public string FileName { get; set; } = string.Empty;

        [Column("file_url")]
        public string FileUrl { get; set; } = string.Empty;

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [Column("client_id")]
        public Guid ClientId { get; set; }

        [Reference(typeof(Client))]
        public Client? Client { get; set; }

        [Column("staff_account_id")]
        public Guid StaffAccountId { get; set; }

        [Reference(typeof(StaffAccount))]
        public StaffAccount? Uploader { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//