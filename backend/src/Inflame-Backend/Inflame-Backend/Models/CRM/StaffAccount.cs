using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using Inflame_Backend.Models.CustomBuild;
using System;
using System.Collections.Generic;

namespace Inflame_Backend.Models.CRM
{
    /// <summary>
    /// Represents a staff account in the CRM system.
    /// </summary>
    [Table("staff_account")]
    public class StaffAccount : BaseModel
    {
        [PrimaryKey("staff_id", false)]
        public Guid StaffId { get; set; } = Guid.NewGuid();

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("identity_user_id")]
        public Guid IdentityUserId { get; set; }

        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Column("profile_image_url")]
        public string? ProfileImageUrl { get; set; }

        [Column("role")]
        public string Role { get; set; } = string.Empty;

        [Column("is_active")]
        public bool IsActive { get; set; }

        [Column("receive_quote_emails")]
        public bool ReceiveQuoteEmails { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Reference(typeof(InternalNote), includeInQuery: false)]
        public List<InternalNote> InternalNotes { get; set; } = new List<InternalNote>();
        
        [Reference(typeof(InvoiceRecord), includeInQuery: false)]
        public List<InvoiceRecord> UploadedInvoices { get; set; } = new List<InvoiceRecord>();
        
        [Reference(typeof(GalleryImage), includeInQuery: false)]
        public List<GalleryImage> UploadedPhotos { get; set; } = new List<GalleryImage>();   
    }
}