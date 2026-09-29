using System.Text;
using System.Threading.RateLimiting;
using Inflame_Backend.Data.Adapters;
using Inflame_Backend.Data.Context;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Data.Repositories.CustomBuild;
using Inflame_Backend.Data.Repositories.ProductCatalog;
using Inflame_Backend.Facades;
using Inflame_Backend.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Register MediatR
builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(typeof(Program).Assembly);
});

//------------------------------------------------------------------------------------------//
#region Rate Limiting

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                // Allows 100 requests per minute per IP
                PermitLimit = 100,
                QueueLimit = 5,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync("{\"error\": \"Too many requests. Please try again later.\"}", token);
    };
});

#endregion
//------------------------------------------------------------------------------------------//
#region Adds Services

// Register Data Instances as Singletons
var redisConnectionString = builder.Configuration.GetConnectionString("Redis") ?? "localhost";
builder.Services.AddSingleton(sp => new RedisInstance(redisConnectionString));

var supabaseUrl = builder.Configuration["Supabase:Url"] ?? string.Empty;
var supabaseKey = builder.Configuration["Supabase:Key"] ?? string.Empty;
builder.Services.AddSingleton(sp => new SupabaseInstance(supabaseUrl, supabaseKey));

builder.Services.AddScoped<IStorageAdapter, SupabaseStorageAdapter>();

// Product Catalog Repositories
builder.Services.AddScoped<PostgresProductRepository>();
builder.Services.AddScoped<IProductRepository>(sp => new CachedProductRepository(sp.GetRequiredService<PostgresProductRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresProductImageRepository>();
builder.Services.AddScoped<IProductImageRepository>(sp => new CachedProductImageRepository(sp.GetRequiredService<PostgresProductImageRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresBraaiProductRepository>();
builder.Services.AddScoped<IBraaiProductRepository>(sp => new CachedBraaiProductRepository(sp.GetRequiredService<PostgresBraaiProductRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresFireplaceProductRepository>();
builder.Services.AddScoped<IFireplaceProductRepository>(sp => new CachedFireplaceProductRepository(sp.GetRequiredService<PostgresFireplaceProductRepository>(), sp.GetRequiredService<RedisInstance>()));

// CRM Repositories
builder.Services.AddScoped<PostgresClientRepository>();
builder.Services.AddScoped<IClientRepository>(sp => new CachedClientRepository(sp.GetRequiredService<PostgresClientRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresEnquiryRepository>();
builder.Services.AddScoped<IEnquiryRepository>(sp => new CachedEnquiryRepository(sp.GetRequiredService<PostgresEnquiryRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresInternalNoteRepository>();
builder.Services.AddScoped<IInternalNoteRepository>(sp => new CachedInternalNoteRepository(sp.GetRequiredService<PostgresInternalNoteRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresInvoiceRecordRepository>();
builder.Services.AddScoped<IInvoiceRecordRepository>(sp => new CachedInvoiceRecordRepository(sp.GetRequiredService<PostgresInvoiceRecordRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresStaffAccountRepository>();
builder.Services.AddScoped<IStaffAccountRepository>(sp => new CachedStaffAccountRepository(sp.GetRequiredService<PostgresStaffAccountRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresAnalyticsLogRepository>();
builder.Services.AddScoped<IAnalyticsLogRepository>(sp => new CachedAnalyticsLogRepository(sp.GetRequiredService<PostgresAnalyticsLogRepository>(), sp.GetRequiredService<RedisInstance>()));

// Custom Build Repositories
builder.Services.AddScoped<PostgresCustomOptionRepository>();
builder.Services.AddScoped<ICustomOptionRepository>(sp => new CachedCustomOptionRepository(sp.GetRequiredService<PostgresCustomOptionRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresCustomBraaiPartRepository>();
builder.Services.AddScoped<ICustomBraaiPartRepository>(sp => new CachedCustomBraaiPartRepository(sp.GetRequiredService<PostgresCustomBraaiPartRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresCustomFireplacePartRepository>();
builder.Services.AddScoped<ICustomFireplacePartRepository>(sp => new CachedCustomFireplacePartRepository(sp.GetRequiredService<PostgresCustomFireplacePartRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresGalleryImageRepository>();
builder.Services.AddScoped<IGalleryImageRepository>(sp => new CachedGalleryImageRepository(sp.GetRequiredService<PostgresGalleryImageRepository>(), sp.GetRequiredService<RedisInstance>()));

// Services
builder.Services.AddScoped<Inflame_Backend.Services.IEmailService, Inflame_Backend.Services.SmtpEmailService>();

// Facades
builder.Services.AddScoped<IProductCatalogueFacade, ProductCatalogueFacade>();

#endregion
//------------------------------------------------------------------------------------------//
#region Forwarded Headers (For Render Deployment)

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    // Render uses a reverse proxy, so we need to forward headers to get the actual client IP for rate limiting
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Clear known networks and proxies so it accepts X-Forwarded-For from any Render proxy
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

#endregion
//------------------------------------------------------------------------------------------//

//------------------------------------------------------------------------------------------//
#region Identity

// Identity Database
var identityConnectionString =
    builder.Configuration.GetConnectionString("IdentityDatabase");

builder.Services.AddDbContext<IdentityDbContext>(options =>
{
    options.UseNpgsql(identityConnectionString);
});

// ASP.NET Core Data Protection
// Required by Identity's default token providers
builder.Services.AddDataProtection();

// ASP.NET Core Identity (RBAC-ready: SuperAdmin, Admin, Employee)
// .AddDefaultTokenProviders() supports Microsoft Authenticator 2FA
builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 12;

        options.User.RequireUniqueEmail = true;

        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan =
            TimeSpan.FromMinutes(15);

        options.SignIn.RequireConfirmedEmail = false;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<IdentityDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<JwtTokenService>();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var jwtKey =
            builder.Configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException(
                "JWT key is not configured.");
        }

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)),

                ValidateIssuer = true,
                ValidIssuer =
                    builder.Configuration["Jwt:Issuer"],

                ValidateAudience = true,
                ValidAudience =
                    builder.Configuration["Jwt:Audience"],

                ValidateLifetime = true,

                ClockSkew = TimeSpan.Zero
            };
    });

builder.Services.AddAuthorization();

#endregion
//------------------------------------------------------------------------------------------//

var app = builder.Build();

app.UseForwardedHeaders();

// Seed identity roles and initial SuperAdmin at application startup
using (var scope = app.Services.CreateScope())
{
    var roleManager =
        scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole<Guid>>>();

    var userManager =
        scope.ServiceProvider
            .GetRequiredService<UserManager<ApplicationUser>>();

    await IdentitySeeder.SeedRolesAsync(roleManager);

    await IdentitySeeder.SeedSuperAdminAsync(
        userManager,
        roleManager,
        app.Configuration);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
//---------------------END OF FILE------------------------------------------------------------------//