using System;

namespace Inflame_Backend.Features.Client.DTOs
{
    public class CreateClientResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? ClientId { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
