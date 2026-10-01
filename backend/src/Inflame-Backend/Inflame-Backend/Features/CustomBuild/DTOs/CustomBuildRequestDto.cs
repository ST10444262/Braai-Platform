using System.ComponentModel.DataAnnotations;

namespace Inflame_Backend.Features.CustomBuild.DTOs
{
    public class CustomBuildRequestDto
    {
        [Required]
        public string OptionType { get; set; } = string.Empty; // e.g., "Free Standing", "Insert Fireplaces"

        [Required]
        public int WidthMm { get; set; }

        [Required]
        public int HeightMm { get; set; }

        [Required]
        public int DepthMm { get; set; }

        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
