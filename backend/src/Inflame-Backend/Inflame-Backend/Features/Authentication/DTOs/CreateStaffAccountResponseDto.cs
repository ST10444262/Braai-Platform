namespace Inflame_Backend.Features.Authentication.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) representing the response returned following a staff account creation request.
    /// Indicates overall execution success, provides operational feedback messages, and returns the generated
    /// CRM StaffId and IdentityUserId references upon successful creation.
    /// </summary>
    public class CreateStaffAccountResponseDto
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public Guid? StaffId { get; set; }

        public Guid? IdentityUserId { get; set; }
    }
}