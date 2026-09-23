
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Data.Repositories;
using Inflame_Backend.Data.Repositories.ProductCatalog;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Data.Repositories.CustomBuild;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

//------------------------------------------------------------------------------------------//
#region Adds Services

// Register Data Instances as Singletons
var redisConnectionString = builder.Configuration.GetConnectionString("Redis") ?? "localhost";
builder.Services.AddSingleton(sp => new RedisInstance(redisConnectionString));

var supabaseUrl = builder.Configuration["Supabase:Url"] ?? string.Empty;
var supabaseKey = builder.Configuration["Supabase:Key"] ?? string.Empty;
builder.Services.AddSingleton(sp => new SupabaseInstance(supabaseUrl, supabaseKey));

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

// Custom Build Repositories
builder.Services.AddScoped<PostgresCustomOptionRepository>();
builder.Services.AddScoped<ICustomOptionRepository>(sp => new CachedCustomOptionRepository(sp.GetRequiredService<PostgresCustomOptionRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresCustomBraaiPartRepository>();
builder.Services.AddScoped<ICustomBraaiPartRepository>(sp => new CachedCustomBraaiPartRepository(sp.GetRequiredService<PostgresCustomBraaiPartRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresCustomFireplacePartRepository>();
builder.Services.AddScoped<ICustomFireplacePartRepository>(sp => new CachedCustomFireplacePartRepository(sp.GetRequiredService<PostgresCustomFireplacePartRepository>(), sp.GetRequiredService<RedisInstance>()));

builder.Services.AddScoped<PostgresGalleryImageRepository>();
builder.Services.AddScoped<IGalleryImageRepository>(sp => new CachedGalleryImageRepository(sp.GetRequiredService<PostgresGalleryImageRepository>(), sp.GetRequiredService<RedisInstance>()));

#endregion
//------------------------------------------------------------------------------------------//

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
//---------------------END OF FILE------------------------------------------------------------------//