using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;

namespace Inflame_Backend.Models.CRM
{
    /// <summary>
    /// Represents a client in the CRM system.
    /// </summary>
    [Table("client")]
    public class Client : BaseModel
    {
        [PrimaryKey("client_id", false)]
        public Guid ClientId { get; set; } = Guid.NewGuid();

        [Column("first_name")]
        public string FirstName { get; set; } = string.Empty;

        [Column("last_name")]
        public string LastName { get; set; } = string.Empty;

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("phone")]
        public string Phone { get; set; } = string.Empty;

        [Column("physical_address")]
        public string PhysicalAddress { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Reference(typeof(Enquiry))]
        public List<Enquiry> Enquiries { get; set; } = new List<Enquiry>();

        [Reference(typeof(InvoiceRecord))]
        public List<InvoiceRecord> InvoiceRecords { get; set; } = new List<InvoiceRecord>();

        [Reference(typeof(InternalNote))]
        public List<InternalNote> InternalNotes { get; set; } = new List<InternalNote>();
    }
}
//---------------------END OF FILE------------------------------------------------------------------//