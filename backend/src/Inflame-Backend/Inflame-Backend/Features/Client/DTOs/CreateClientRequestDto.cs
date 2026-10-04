using System;
using System.ComponentModel.DataAnnotations;

namespace Inflame_Backend.Features.Client.DTOs
{
    public class CreateClientRequestDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        public string PhysicalAddress { get; set; } = string.Empty;
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
