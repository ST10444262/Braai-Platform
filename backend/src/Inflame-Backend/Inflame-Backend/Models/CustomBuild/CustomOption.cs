using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;

namespace Inflame_Backend.Models.CustomBuild
{
    /// <summary>
    /// Represents a custom option for a braai or fireplace build, including its type, material, style, dimensions, and associated parts.
    /// </summary>
    [Table("custom_braai_option")]
    public class CustomOption : BaseModel
    {
        [PrimaryKey("custom_option_id", false)]
        public Guid CustomOptionId { get; set; } = Guid.NewGuid();

        [Column("option_type")]
        public string OptionType { get; set; } = string.Empty;

        [Column("material")]
        public string Material { get; set; } = string.Empty;

        [Column("style_option")]
        public string StyleOption { get; set; } = string.Empty;

        [Column("width_mm")]
        public int WidthMm { get; set; }

        [Column("height_mm")]
        public int HeightMm { get; set; }

        [Column("depth_mm")]
        public int DepthMm { get; set; }

        [Column("intel_mm")]
        public int IntelMm { get; set; }

        [Column("additional_message")]
        public string AdditionalMessage { get; set; } = string.Empty;

        [Reference(typeof(CustomBraaiPart))]
        public List<CustomBraaiPart> BraaiParts { get; set; } = new List<CustomBraaiPart>();

        [Reference(typeof(CustomFireplacePart))]
        public List<CustomFireplacePart> FireplaceParts { get; set; } = new List<CustomFireplacePart>();
    }
}
//---------------------END OF FILE------------------------------------------------------------------//