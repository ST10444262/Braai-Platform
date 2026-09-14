using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;

namespace Inflame_Backend.Models.CustomBuild
{
    /// <summary>
    /// Represents a part of a custom fireplace option in the Inflame application.
    /// </summary>
    [Table("custom_fireplace_part")]
    public class CustomFireplacePart : BaseModel
    {
        [PrimaryKey("part_id", false)]
        public Guid PartId { get; set; } = Guid.NewGuid();

        [Column("custom_option_id")]
        public Guid CustomOptionId { get; set; }

        [Column("part_name")]
        public string PartName { get; set; } = string.Empty;

        [Reference(typeof(CustomOption))]
        public CustomOption? CustomOption { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//