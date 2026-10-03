namespace Inflame_Backend.Features.Authentication.DTOs
{
    public class SetupTwoFactorRequestDto
    {
        public string Challenge { get; set; } = string.Empty;
    }
}