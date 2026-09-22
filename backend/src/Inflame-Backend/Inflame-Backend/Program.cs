
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Data.Repositories;
using Inflame_Backend.Data.Repositories.ProductCatalog;


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