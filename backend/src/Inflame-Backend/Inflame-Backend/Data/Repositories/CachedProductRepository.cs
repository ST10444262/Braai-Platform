using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.ProductCatalog;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories
{

    /// <summary>
    /// Caching decorator implementing IProductRepository around Upstash Redis.
    /// Intercepts read queries to fetch cached JSON from Upstash Redis, falling back to Supabase on misses.
    /// </summary>
    public class CachedProductRepository : IProductRepository
    {
        #region Configuration
        private readonly IProductRepository _innerRepository;
        private readonly IDatabase _redisDatabase;
        private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Injects the interface and the RedisInstance into the CachedProductRepository constructor.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedProductRepository(IProductRepository innerRepository, RedisInstance redisInstance)
        {
            _innerRepository = innerRepository;
            _redisDatabase = redisInstance.GetDatabase();
        }
        #endregion
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves a product by its ID, first checking the Redis cache before querying the underlying repository.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<Product?> GetByIdAsync(Guid id)
        {
            string cacheKey = $"product:{id}";

            RedisValue cachedProduct = await _redisDatabase.StringGetAsync(cacheKey);
            if (!cachedProduct.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<Product>((string)cachedProduct!);
            }

            var product = await _innerRepository.GetByIdAsync(id);

            if (product != null)
            {
                string serialized = JsonSerializer.Serialize(product);
                await _redisDatabase.StringSetAsync(cacheKey, serialized, CacheExpiration);

            }

            return product;
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves all products, first checking the Redis cache before querying the underlying repository.
        /// </summary>
        /// <returns></returns>
        public async Task<List<Product>> GetAllAsync()
        {
            string cacheKey = "products:all";

            RedisValue cachedValues = await _redisDatabase.StringGetAsync(cacheKey);
            if (!cachedValues.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<List<Product>>((string)cachedValues!) ?? new List<Product>();
            }

            var products = await _innerRepository.GetAllAsync();

            if (products != null && products.Count > 0)
            {
                string serialized = JsonSerializer.Serialize(products);
                await _redisDatabase.StringSetAsync(cacheKey, serialized, CacheExpiration);
            }

            return products;
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Adds a new product to the underlying repository and invalidates the relevant cache entries in Redis.
        /// </summary>
        /// <param name="product"></param>
        /// <returns></returns>
        public async Task AddAsync(Product product)
        {
            await _innerRepository.AddAsync(product);
            await _redisDatabase.KeyDeleteAsync($"product:{product.ProductId}");
            await _redisDatabase.KeyDeleteAsync("products:all");
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Updates an existing product in the underlying repository and invalidates the relevant cache entries in Redis.
        /// </summary>
        /// <param name="product"></param>
        /// <returns></returns>
        public async Task UpdateAsync(Product product)
        {
            await _innerRepository.UpdateAsync(product);
            await _redisDatabase.KeyDeleteAsync($"product:{product.ProductId}");
            await _redisDatabase.KeyDeleteAsync("products:all");
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Deletes a product by its ID from the underlying repository and invalidates the relevant cache entries in Redis.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task DeleteAsync(Guid id)
        {
            await _innerRepository.DeleteAsync(id);
            await _redisDatabase.KeyDeleteAsync($"product:{id}");
            await _redisDatabase.KeyDeleteAsync("products:all");
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//