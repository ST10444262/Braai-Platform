using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.ProductCatalog;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories
{
    public class CachedProductRepository : IProductRepository
    {
        private readonly IProductRepository _innerRepository;
        private readonly IDatabase _redisDatabase;
        private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);

        public CachedProductRepository(IProductRepository innerRepository, RedisInstance redisInstance)
        {
            _innerRepository = innerRepository;
            _redisDatabase = redisInstance.GetDatabase();
        }

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

        public async Task<List<Product>> GetAllAsync()
        {
            string cacheKey = "products:all";
           
            RedisValue cachedValues = await _redisDatabase.StringGetAsync(cacheKey);
            if (!cachedValues.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<List<Product>>((string)cachedValues!)?? new List<Product>();
            }
           
            var products = await _innerRepository.GetAllAsync();

            if (products != null && products.Count > 0)
            {
                string serialized = JsonSerializer.Serialize(products);
                await _redisDatabase.StringSetAsync(cacheKey, serialized, CacheExpiration);
            }

            return products;
        }

        public async Task AddAsync(Product product)
        {
            await _innerRepository.AddAsync(product);
            await _redisDatabase.KeyDeleteAsync($"product:{product.ProductId}");
            await _redisDatabase.KeyDeleteAsync("products:all");
        }

        public async Task UpdateAsync(Product product)
        {
            await _innerRepository.UpdateAsync(product);
            await _redisDatabase.KeyDeleteAsync($"product:{product.ProductId}");
            await _redisDatabase.KeyDeleteAsync("products:all");
        }

        public async Task DeleteAsync(Guid id)
        {
            await _innerRepository.DeleteAsync(id);
            await _redisDatabase.KeyDeleteAsync($"product:{id}");
            await _redisDatabase.KeyDeleteAsync("products:all");
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//