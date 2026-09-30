using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Identity
{
    /// <summary>
    /// Custom identity user entity extending ASP.NET Core Identity's IdentityUser with a Guid primary key.
    /// Incorporates additional application-specific profile properties such as full name, account activation status, and creation timestamp.
    /// </summary>
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FullName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
//---------------------END OF FILE------------------------------------------------------------------//