using Inflame_Backend.Identity;
using Inflame_Backend.Models.CRM;
using Inflame_Backend.Models.CustomBuild;
using Inflame_Backend.Models.ProductCatalog;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Inflame_Backend.Data.Context
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Entity Framework Core database context managing ASP.NET Core Identity tables,
    /// staff accounts, and business domain models (CRM, Products, Custom Builds).
    /// </summary>
    #region Context
    public class IdentityDbContext
        : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        public DbSet<StaffTrustedDevice> StaffTrustedDevices { get; set; }

        // CRM Tables
        public DbSet<Client> Clients { get; set; }
        public DbSet<StaffAccount> StaffAccounts { get; set; }
        public DbSet<Enquiry> Enquiries { get; set; }
        public DbSet<InternalNote> InternalNotes { get; set; }
        public DbSet<InvoiceRecord> InvoiceRecords { get; set; }
        public DbSet<AnalyticsLog> AnalyticsLogs { get; set; }

        // Product Catalog Tables
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<BraaiProduct> BraaiProducts { get; set; }
        public DbSet<FireplaceProduct> FireplaceProducts { get; set; }

        // Custom Build Tables
        public DbSet<CustomOption> CustomOptions { get; set; }
        public DbSet<CustomBraaiPart> CustomBraaiParts { get; set; }
        public DbSet<CustomFireplacePart> CustomFireplaceParts { get; set; }
        public DbSet<GalleryImage> GalleryImages { get; set; }

        //------------------------------------------------------------------------------------------//

        public IdentityDbContext(
            DbContextOptions<IdentityDbContext> options)
            : base(options)
        {
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Configures the database schema, relationships, keys, and constraints for Identity and Business entities.
        /// </summary>

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            #region Identity Mappings

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

            #endregion

            #region CRM Mappings

            builder.Entity<Client>(entity =>
            {
                entity.ToTable("client");
                entity.HasKey(e => e.ClientId);
                entity.Property(e => e.ClientId).HasColumnName("client_id");
                entity.Property(e => e.FirstName).HasColumnName("first_name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.LastName).HasColumnName("last_name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
                entity.Property(e => e.Phone).HasColumnName("phone").HasMaxLength(30);
                entity.Property(e => e.PhysicalAddress).HasColumnName("physical_address").HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.Email);
            });

            builder.Entity<StaffAccount>(entity =>
            {
                entity.ToTable("staff_account");
                entity.HasKey(e => e.StaffId);
                entity.Property(e => e.StaffId).HasColumnName("staff_id");
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
                entity.Property(e => e.IdentityUserId).HasColumnName("identity_user_id").IsRequired();
                entity.Property(e => e.FullName).HasColumnName("full_name").HasMaxLength(150).IsRequired();
                entity.Property(e => e.ProfileImageUrl).HasColumnName("profile_image_url").HasMaxLength(500);
                entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(50).IsRequired();
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.ReceiveQuoteEmails).HasColumnName("receive_quote_emails").HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.IdentityUserId);
            });

            builder.Entity<InternalNote>(entity =>
            {
                entity.ToTable("internal_note");
                entity.HasKey(e => e.NoteId);
                entity.Property(e => e.NoteId).HasColumnName("note_id");
                entity.Property(e => e.Content).HasColumnName("content").IsRequired();
                entity.Property(e => e.ClientId).HasColumnName("client_id");
                entity.Property(e => e.StaffAccountId).HasColumnName("staff_account_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Client)
                      .WithMany(c => c.InternalNotes)
                      .HasForeignKey(e => e.ClientId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Author)
                      .WithMany(s => s.InternalNotes)
                      .HasForeignKey(e => e.StaffAccountId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<InvoiceRecord>(entity =>
            {
                entity.ToTable("invoice_record");
                entity.HasKey(e => e.InvoiceId);
                entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
                entity.Property(e => e.FileName).HasColumnName("file_name").HasMaxLength(255).IsRequired();
                entity.Property(e => e.FileUrl).HasColumnName("file_url").HasMaxLength(500).IsRequired();
                entity.Property(e => e.ClientId).HasColumnName("client_id");
                entity.Property(e => e.StaffAccountId).HasColumnName("staff_account_id");
                entity.Property(e => e.UploadedAt).HasColumnName("uploaded_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Client)
                      .WithMany(c => c.InvoiceRecords)
                      .HasForeignKey(e => e.ClientId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Uploader)
                      .WithMany(s => s.UploadedInvoices)
                      .HasForeignKey(e => e.StaffAccountId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<AnalyticsLog>(entity =>
            {
                entity.ToTable("analytics_logs");
                entity.HasKey(e => e.LogId);
                entity.Property(e => e.LogId).HasColumnName("log_id");
                entity.Property(e => e.Action).HasColumnName("action").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Details).HasColumnName("details");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            #endregion

            #region Product Catalog Mappings

            builder.Entity<Product>(entity =>
            {
                entity.ToTable("product");
                entity.HasKey(e => e.ProductId);
                entity.Property(e => e.ProductId).HasColumnName("product_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(100).IsRequired();
                entity.Property(e => e.ProductType).HasColumnName("product_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Brand).HasColumnName("brand").HasMaxLength(100).IsRequired();
                entity.Property(e => e.IsImported).HasColumnName("is_imported").HasDefaultValue(false);
                entity.Property(e => e.IsCustomisable).HasColumnName("is_customisable").HasDefaultValue(false);
                entity.Property(e => e.Price).HasColumnName("price").HasPrecision(18, 2);
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.OnSpecial).HasColumnName("on_special").HasPrecision(18, 2);
                entity.Property(e => e.IsVisible).HasColumnName("is_visible").HasDefaultValue(true);

                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.ProductType);
            });

            builder.Entity<ProductImage>(entity =>
            {
                entity.ToTable("product_image");
                entity.HasKey(e => e.ImageId);
                entity.Property(e => e.ImageId).HasColumnName("image_id");
                entity.Property(e => e.ProductId).HasColumnName("product_id");
                entity.Property(e => e.Url).HasColumnName("url").HasMaxLength(500).IsRequired();
                entity.Property(e => e.IsPrimary).HasColumnName("is_primary").HasDefaultValue(false);

                entity.HasOne(e => e.Product)
                      .WithMany(p => p.Images)
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<BraaiProduct>(entity =>
            {
                entity.ToTable("braai_product");
                entity.HasKey(e => e.ProductId);
                entity.Property(e => e.ProductId).HasColumnName("product_id");
                entity.Property(e => e.FuelType).HasColumnName("fuel_type").HasMaxLength(100);
                entity.Property(e => e.BraaiType).HasColumnName("braai_type").HasMaxLength(100);

                entity.HasOne(e => e.BaseProduct)
                      .WithOne()
                      .HasForeignKey<BraaiProduct>(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<FireplaceProduct>(entity =>
            {
                entity.ToTable("fireplace_product");
                entity.HasKey(e => e.ProductId);
                entity.Property(e => e.ProductId).HasColumnName("product_id");
                entity.Property(e => e.HeatOutputKw).HasColumnName("heat_output_kw").HasPrecision(18, 2);
                entity.Property(e => e.FireplaceType).HasColumnName("fireplace_type").HasMaxLength(100);

                entity.HasOne(e => e.BaseProduct)
                      .WithOne()
                      .HasForeignKey<FireplaceProduct>(e => e.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            #endregion

            #region Custom Build Mappings

            builder.Entity<CustomOption>(entity =>
            {
                entity.ToTable("custom_braai_option");
                entity.HasKey(e => e.CustomOptionId);
                entity.Property(e => e.CustomOptionId).HasColumnName("custom_option_id");
                entity.Property(e => e.OptionType).HasColumnName("option_type").HasMaxLength(50);
                entity.Property(e => e.Material).HasColumnName("material").HasMaxLength(50);
                entity.Property(e => e.StyleOption).HasColumnName("style_option").HasMaxLength(50);
                entity.Property(e => e.WidthMm).HasColumnName("width_mm");
                entity.Property(e => e.HeightMm).HasColumnName("height_mm");
                entity.Property(e => e.DepthMm).HasColumnName("depth_mm");
                entity.Property(e => e.IntelMm).HasColumnName("intel_mm");
                entity.Property(e => e.AdditionalMessage).HasColumnName("additional_message");
            });

            builder.Entity<CustomBraaiPart>(entity =>
            {
                entity.ToTable("custom_braai_part");
                entity.HasKey(e => e.PartId);
                entity.Property(e => e.PartId).HasColumnName("part_id");
                entity.Property(e => e.CustomOptionId).HasColumnName("custom_option_id");
                entity.Property(e => e.PartName).HasColumnName("part_name").HasMaxLength(100).IsRequired();

                entity.HasOne(e => e.CustomOption)
                      .WithMany(o => o.BraaiParts)
                      .HasForeignKey(e => e.CustomOptionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<CustomFireplacePart>(entity =>
            {
                entity.ToTable("custom_fireplace_part");
                entity.HasKey(e => e.PartId);
                entity.Property(e => e.PartId).HasColumnName("part_id");
                entity.Property(e => e.CustomOptionId).HasColumnName("custom_option_id");
                entity.Property(e => e.PartName).HasColumnName("part_name").HasMaxLength(100).IsRequired();

                entity.HasOne(e => e.CustomOption)
                      .WithMany(o => o.FireplaceParts)
                      .HasForeignKey(e => e.CustomOptionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<GalleryImage>(entity =>
            {
                entity.ToTable("gallery_photo");
                entity.HasKey(e => e.PhotoId);
                entity.Property(e => e.PhotoId).HasColumnName("photo_id");
                entity.Property(e => e.UploadedById).HasColumnName("uploaded_by");
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Url).HasColumnName("url").HasMaxLength(500).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.UploadedAt).HasColumnName("uploaded_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.UploadedBy)
                      .WithMany(s => s.UploadedPhotos)
                      .HasForeignKey(e => e.UploadedById)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            #endregion

            #region Enquiries Mapping

            builder.Entity<Enquiry>(entity =>
            {
                entity.ToTable("enquiry");
                entity.HasKey(e => e.EnquiryId);
                entity.Property(e => e.EnquiryId).HasColumnName("enquiry_id");
                entity.Property(e => e.EnquiryType).HasColumnName("enquiry_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.FirstName).HasColumnName("first_name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.LastName).HasColumnName("last_name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
                entity.Property(e => e.Phone).HasColumnName("phone").HasMaxLength(30);
                entity.Property(e => e.ProductId).HasColumnName("product_id");
                entity.Property(e => e.CustomOptionId).HasColumnName("custom_option_id");
                entity.Property(e => e.ClientId).HasColumnName("client_id");
                entity.Property(e => e.Message).HasColumnName("message");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50).HasDefaultValue("New");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Product)
                      .WithMany()
                      .HasForeignKey(e => e.ProductId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.CustomOption)
                      .WithMany()
                      .HasForeignKey(e => e.CustomOptionId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Client)
                      .WithMany(c => c.Enquiries)
                      .HasForeignKey(e => e.ClientId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            #endregion

            #region Ignore Supabase Postgrest BaseModel Properties

            builder.Ignore<Supabase.Postgrest.ClientOptions>();

            var baseModelEntities = builder.Model.GetEntityTypes()
                .Where(t => typeof(Supabase.Postgrest.Models.BaseModel).IsAssignableFrom(t.ClrType))
                .Select(t => t.ClrType)
                .ToList();

            foreach (var clrType in baseModelEntities)
            {
                builder.Entity(clrType).Ignore(nameof(Supabase.Postgrest.Models.BaseModel.RequestClientOptions));
                builder.Entity(clrType).Ignore(nameof(Supabase.Postgrest.Models.BaseModel.PrimaryKey));
                builder.Entity(clrType).Ignore(nameof(Supabase.Postgrest.Models.BaseModel.BaseUrl));
                builder.Entity(clrType).Ignore(nameof(Supabase.Postgrest.Models.BaseModel.TableName));
            }

            #endregion
        }
    }
    #endregion
}
//---------------------END OF FILE------------------------------------------------------------------//