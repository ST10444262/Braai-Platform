namespace Inflame_Backend.Features.Authentication.DTOs
{
    public class VerifyLoginTwoFactorRequestDto
    {
        public string Challenge { get; set; } = string.Empty;

        public string Code { get; set; } = string.Empty;

        public bool RememberDevice { get; set; }
    }
}