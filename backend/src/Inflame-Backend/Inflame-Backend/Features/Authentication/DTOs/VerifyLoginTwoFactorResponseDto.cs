namespace Inflame_Backend.Features.Authentication.DTOs
{
    public class VerifyLoginTwoFactorResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public string? Token { get; set; }

        public DateTime? ExpiresAt { get; set; }
    }
}