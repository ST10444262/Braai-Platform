namespace Inflame_Backend.Features.Authentication.DTOs
{
    public class VerifyLoginTwoFactorRequestDto
    {
        public Guid UserId { get; set; }

        public string Code { get; set; } = string.Empty;
    }
}