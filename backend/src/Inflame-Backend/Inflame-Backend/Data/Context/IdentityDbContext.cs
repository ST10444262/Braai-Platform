using Inflame_Backend.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Inflame_Backend.Data.Context
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Entity Framework Core database context managing ASP.NET Core Identity tables and custom ApplicationUser mappings.
    /// Uses Guid primary keys for users and roles, and configures default database constraints for profile fields.
    /// </summary>
    #region Context
    public class IdentityDbContext
        : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        public DbSet<StaffTrustedDevice> StaffTrustedDevices { get; set; }

        //------------------------------------------------------------------------------------------//

        public IdentityDbContext(
            DbContextOptions<IdentityDbContext> options)
            : base(options)
        {
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Configures the database schema and constraints for the Identity context.
        /// </summary>

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(x => x.FullName)
                    .HasMaxLength(150);

                entity.Property(x => x.IsActive)
                    .HasDefaultValue(true);

                entity.Property(x => x.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            builder.Entity<StaffTrustedDevice>(entity =>
            {
                entity.ToTable("StaffTrustedDevices");
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
    #endregion
}
//---------------------END OF FILE------------------------------------------------------------------//