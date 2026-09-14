using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace Inflame_Backend.Data.Repositories
{

    /// <summary>
    /// Primary database repository interacting directly with Supabase PostgreSQL via Postgrest SDK.
    /// Provides reliable, persistent storage reads and writes for Product catalog data.
    /// </summary>
    public class PostgresProductRepository : IProductRepository

    {
        private readonly SupabaseInstance _supabaseInstance;

        public PostgresProductRepository(SupabaseInstance supabaseInstance)
        {
            _supabaseInstance = supabaseInstance;
        }

        public async Task<Product?> GetByIdAsync(Guid id)
        {
            var response = await _supabaseInstance.Client.From<Product>().Where(p => p.ProductId == id).Single();
            return response;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            var response = await _supabaseInstance.Client.From<Product>().Get();
            return response.Models;
        }

        public async Task AddAsync(Product product)
        {
            await _supabaseInstance.Client.From<Product>().Insert(product);
        }

        public async Task UpdateAsync(Product product)
        {
            await _supabaseInstance.Client.From<Product>().Where(p => p.ProductId == product.ProductId).Update(product);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _supabaseInstance.Client.From<Product>().Where(p => p.ProductId == id).Delete();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//