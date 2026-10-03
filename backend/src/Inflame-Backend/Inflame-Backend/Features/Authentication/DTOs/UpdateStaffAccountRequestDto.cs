using Microsoft.AspNetCore.Http;

namespace Inflame_Backend.Features.Authentication.DTOs
{
    public class UpdateStaffAccountRequestDto
    {
        public string Email { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Role { get; set; } = "Employee";

        public bool IsActive { get; set; } = true;

        public string? NewPassword { get; set; }

        public IFormFile? ProfileImage { get; set; }
    }
}