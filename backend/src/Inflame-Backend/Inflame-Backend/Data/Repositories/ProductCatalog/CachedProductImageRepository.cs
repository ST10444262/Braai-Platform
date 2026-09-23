using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.ProductCatalog
{
    /// <summary>
    /// Cached implementation of the IProductImageRepository using Redis.
    /// </summary>
    public class CachedProductImageRepository : CachedBaseRepository<ProductImage>, IProductImageRepository
    {
        #region Configuration
        private readonly IProductImageRepository _innerSpecificRepository;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the CachedProductImageRepository.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedProductImageRepository(IProductImageRepository innerRepository, RedisInstance redisInstance)
            : base(innerRepository, redisInstance)
        {
            _innerSpecificRepository = innerRepository;
        }
        #endregion
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves a ProductImage by its unique identifier, checking the cache first.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<ProductImage?> GetByIdAsync(Guid id)
        {
            string cacheKey = $"{_cacheKeyPrefix}:{id}";

            var cachedValue = await _redisDatabase.StringGetAsync(cacheKey);
            if (!cachedValue.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<ProductImage>((string)cachedValue!);
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
