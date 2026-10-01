using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Identity
{
    /// <summary>
    /// Provides utility methods to seed default Role-Based Access Control (RBAC) roles 
    /// (SuperAdmin, Admin, Employee) and initial administrative accounts into the ASP.NET Core Identity database at startup.
    /// </summary>
    public static class IdentitySeeder
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Seeds the default roles (SuperAdmin, Admin, Employee) if they do not already exist.
        /// </summary>
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
                    var result = await roleManager.CreateAsync(
                        new IdentityRole<Guid>(role));

                    if (!result.Succeeded)
                    {
                        throw new InvalidOperationException(
                            $"Failed to create role '{role}': " +
                            string.Join(", ",
                                result.Errors.Select(e => e.Description)));
                    }
                }
            }
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Seeds an initial SuperAdmin user into the Identity database using credentials specified in the configuration.
        /// </summary>
        /// <param name="userManager"></param>
        /// <param name="roleManager"></param>
        /// <param name="configuration"></param>
        /// <returns></returns>
        /// <exception cref="InvalidOperationException"></exception>
        public static async Task SeedSuperAdminAsync(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            IConfiguration configuration)
        {
            var email =
                configuration["Identity:SeedAdmin:Email"];

            var password =
                configuration["Identity:SeedAdmin:Password"];

            if (string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException(
                    "Initial SuperAdmin credentials are not configured.");
            }

            var existingUser =
                await userManager.FindByEmailAsync(email);

            if (existingUser != null)
            {
                return;
            }

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = "Initial SuperAdmin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var createResult =
                await userManager.CreateAsync(user, password);

            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException(
                    "Failed to create initial SuperAdmin: " +
                    string.Join(", ",
                        createResult.Errors.Select(e => e.Description)));
            }

            var roleExists =
                await roleManager.RoleExistsAsync("SuperAdmin");

            if (!roleExists)
            {
                throw new InvalidOperationException(
                    "SuperAdmin role does not exist.");
            }

            var roleResult =
                await userManager.AddToRoleAsync(
                    user,
                    "SuperAdmin");

            if (!roleResult.Succeeded)
            {
                throw new InvalidOperationException(
                    "Failed to assign SuperAdmin role: " +
                    string.Join(", ",
                        roleResult.Errors.Select(e => e.Description)));
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//