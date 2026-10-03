using Microsoft.AspNetCore.Http;

namespace Inflame_Backend.Features.Authentication.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) representing the request payload for creating
    /// a new staff account.
    /// </summary>
    public class CreateStaffAccountRequestDto
    {
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Role { get; set; } = "Employee";

        public IFormFile? ProfileImage { get; set; }
    }
}