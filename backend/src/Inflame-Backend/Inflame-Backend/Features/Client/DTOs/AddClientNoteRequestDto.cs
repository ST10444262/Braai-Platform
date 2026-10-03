using System;
using System.ComponentModel.DataAnnotations;

namespace Inflame_Backend.Features.Client.DTOs
{
    public class AddClientNoteRequestDto
    {
        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public Guid StaffAccountId { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
