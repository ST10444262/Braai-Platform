using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Identity
{
    /// <summary>
    /// Provides utility methods to seed default Role-Based Access Control (RBAC) roles 
    /// (SuperAdmin, Admin, Employee) into the ASP.NET Core Identity database at startup.
    /// </summary>
    public static class IdentitySeeder
    {
        public static async Task SeedRolesAsync(
            RoleManager<IdentityRole<Guid>> roleManager)
        {
            string[] roles =
            {
                "SuperAdmin",
                "Admin",
                "Employee"
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(
                        new IdentityRole<Guid>(role));
                }
            }
        }
    }
}