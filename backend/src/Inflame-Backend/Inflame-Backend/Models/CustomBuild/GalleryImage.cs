using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using Inflame_Backend.Models.CRM;
using System;

namespace Inflame_Backend.Models.CustomBuild
{
    /// <summary>
    /// Represents an image in the gallery, including its metadata and the user who uploaded it.
    /// </summary>
    [Table("gallery_photo")]
    public class GalleryImage : BaseModel
    {
        [PrimaryKey("photo_id", false)]
        public Guid PhotoId { get; set; } = Guid.NewGuid();

        [Column("uploaded_by")]
        public Guid UploadedById { get; set; }

        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("url")]
        public string Url { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [Reference(typeof(StaffAccount))]
        public StaffAccount? UploadedBy { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//