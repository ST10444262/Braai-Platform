using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;

namespace Inflame_Backend.Models.CRM
{
    /// <summary>
    /// Represents an analytics log for leads and quotes.
    /// </summary>
    [Table("analytics_logs")]
    public class AnalyticsLog : BaseModel
    {
        //------------------------------------------------------------------------------------------//
        [PrimaryKey("log_id", false)]
        public Guid LogId { get; set; } = Guid.NewGuid();

        //------------------------------------------------------------------------------------------//
        [Column("action")]
        public string Action { get; set; } = string.Empty;

        //------------------------------------------------------------------------------------------//
        [Column("details")]
        public string Details { get; set; } = string.Empty;

        //------------------------------------------------------------------------------------------//
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
