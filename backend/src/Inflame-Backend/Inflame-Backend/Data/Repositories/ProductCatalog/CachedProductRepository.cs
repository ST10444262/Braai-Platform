using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.ProductCatalog
{
    /// <summary>
    /// Cached implementation of the IProductRepository using Redis.
    /// </summary>
    public class CachedProductRepository : CachedBaseRepository<Product>, IProductRepository
    {
        #region Configuration
        private readonly IProductRepository _innerSpecificRepository;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the CachedProductRepository.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedProductRepository(IProductRepository innerRepository, RedisInstance redisInstance)
            : base(innerRepository, redisInstance)
        {
            _innerSpecificRepository = innerRepository;
        }
        #endregion
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves a Product by its unique identifier, checking the cache first.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<Product?> GetByIdAsync(Guid id)
        {
            string cacheKey = $"{_cacheKeyPrefix}:{id}";

            var cachedValue = await _redisDatabase.StringGetAsync(cacheKey);
            if (!cachedValue.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<Product>((string)cachedValue!);
            }

            var entity = await _innerSpecificRepository.GetByIdAsync(id);

            if (entity != null)
            {
                string serialized = JsonSerializer.Serialize(entity);
                await _redisDatabase.StringSetAsync(cacheKey, serialized, CacheExpiration);
            }

            return entity;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
