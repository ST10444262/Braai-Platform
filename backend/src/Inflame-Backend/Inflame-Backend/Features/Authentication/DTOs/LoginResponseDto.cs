namespace Inflame_Backend.Features.Authentication.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) representing the response returned following a login attempt.
    /// Indicates overall authentication success, 2FA requirements, user feedback messages,
    /// and contains the generated JWT token with its expiration timestamp.
    /// </summary>
    public class LoginResponseDto
    {
        public bool Success { get; set; }

        public bool RequiresTwoFactor { get; set; }

        public string Message { get; set; } = string.Empty;

        public string? Token { get; set; }

        public DateTime? ExpiresAt { get; set; }
    }
}