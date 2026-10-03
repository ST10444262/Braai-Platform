using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;

namespace Inflame_Backend.Models.CRM
{
    /// <summary>
    /// Represents an internal note associated with a client, created by a staff account.
    /// </summary>
    [Table("internal_note")]
    public class InternalNote : BaseModel
    {
        [PrimaryKey("note_id", false)]
        public Guid NoteId { get; set; } = Guid.NewGuid();

        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("client_id")]
        public Guid ClientId { get; set; }

        [Reference(typeof(Client), includeInQuery: false)]
        public Client? Client { get; set; }

        [Column("staff_account_id")]
        public Guid StaffAccountId { get; set; }

        [Reference(typeof(StaffAccount), includeInQuery: false)]
        public StaffAccount? Author { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//