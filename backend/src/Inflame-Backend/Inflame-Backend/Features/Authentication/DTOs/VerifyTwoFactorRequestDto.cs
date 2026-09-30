namespace Inflame_Backend.Features.Authentication.DTOs
{
    public class VerifyTwoFactorRequestDto
    {
        public string Code { get; set; } = string.Empty;
    }
}