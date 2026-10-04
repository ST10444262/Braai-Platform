namespace Inflame_Backend.Features.Authentication.DTOs
{
    public class VerifyTwoFactorResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool TwoFactorEnabled { get; set; }

        public string? Token { get; set; }

        public DateTime? ExpiresAt { get; set; }
    }
}