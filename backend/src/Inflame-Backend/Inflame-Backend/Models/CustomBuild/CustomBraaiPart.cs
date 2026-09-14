using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;

namespace Inflame_Backend.Models.CustomBuild
{
    /// <summary>
    /// Represents a custom braai part in the system.
    /// </summary>
    [Table("custom_braai_part")]
    public class CustomBraaiPart : BaseModel
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