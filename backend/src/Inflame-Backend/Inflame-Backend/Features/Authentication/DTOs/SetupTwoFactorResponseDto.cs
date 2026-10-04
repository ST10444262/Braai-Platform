namespace Inflame_Backend.Features.Authentication.DTOs
{
    public class SetupTwoFactorResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public string? SharedKey { get; set; }

        public string? AuthenticatorUri { get; set; }
    }
}