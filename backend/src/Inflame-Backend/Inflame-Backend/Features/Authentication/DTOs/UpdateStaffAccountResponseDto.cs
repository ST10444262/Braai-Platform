namespace Inflame_Backend.Features.Authentication.DTOs
{
    public class UpdateStaffAccountResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public Guid? StaffId { get; set; }

        public Guid? IdentityUserId { get; set; }
    }
}