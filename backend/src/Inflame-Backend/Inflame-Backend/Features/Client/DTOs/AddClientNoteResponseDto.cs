using System;

namespace Inflame_Backend.Features.Client.DTOs
{
    public class AddClientNoteResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? NoteId { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
