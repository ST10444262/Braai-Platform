namespace Inflame_Backend.Features.Authentication.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) representing the user login request payload,
    /// carrying the email address and password required for authentication.
    /// </summary>
    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
    }
}