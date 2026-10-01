namespace Inflame_Backend.Features.Authentication.DTOs
{
    public class ResetTwoFactorResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;
    }
}