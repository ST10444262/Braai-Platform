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
        #region Configuration
        private readonly SupabaseInstance _supabaseInstance;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Inject the SupabaseInstance to enable direct database operations.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresProductRepository(SupabaseInstance supabaseInstance)
        {
            _supabaseInstance = supabaseInstance;
        }
        #endregion
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch a single product by its unique identifier from the PostgreSQL database.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<Product?> GetByIdAsync(Guid id)
        {
            var response = await _supabaseInstance.Client.From<Product>().Where(p => p.ProductId == id).Single();
            return response;
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch all products from the PostgreSQL database.
        /// </summary>
        /// <returns></returns>
        public async Task<List<Product>> GetAllAsync()
        {
            var response = await _supabaseInstance.Client.From<Product>().Get();
            return response.Models;
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Add a new product to the PostgreSQL database.
        /// </summary>
        /// <param name="product"></param>
        /// <returns></returns>
        public async Task AddAsync(Product product)
        {
            await _supabaseInstance.Client.From<Product>().Insert(product);
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Update an existing product in the PostgreSQL database.
        /// </summary>
        /// <param name="product"></param>
        /// <returns></returns>
        public async Task UpdateAsync(Product product)
        {
            await _supabaseInstance.Client.From<Product>().Where(p => p.ProductId == product.ProductId).Update(product);
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Delete a product from the PostgreSQL database by its unique identifier.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task DeleteAsync(Guid id)
        {
            await _supabaseInstance.Client.From<Product>().Where(p => p.ProductId == id).Delete();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//