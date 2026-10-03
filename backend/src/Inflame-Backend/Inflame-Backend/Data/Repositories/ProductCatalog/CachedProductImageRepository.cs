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
        #region Handler Methods
        //------------------------------------------------------------------------------------------//
        public async Task<System.Collections.Generic.List<ProductImage>> GetByProductIdAsync(Guid productId)
        {
            var cacheKey = $"{_cacheKeyPrefix}_ProductId_{productId}";
            var cachedData = await _redisDatabase.StringGetAsync(cacheKey);

            if (!cachedData.IsNullOrEmpty)
            {
                var result = JsonSerializer.Deserialize<System.Collections.Generic.List<ProductImage>>((string)cachedData!);
                if (result != null) return result;
            }

            var dbData = await _innerSpecificRepository.GetByProductIdAsync(productId);
            if (dbData != null)
            {
                var options = new JsonSerializerOptions { ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles };
                await _redisDatabase.StringSetAsync(cacheKey, JsonSerializer.Serialize(dbData, options), CacheExpiration);
            }

            return dbData ?? new System.Collections.Generic.List<ProductImage>();
        }
        public override async Task<ProductImage> AddAsync(ProductImage entity)
        {
            var inserted = await base.AddAsync(entity);
            await _redisDatabase.KeyDeleteAsync($"{_cacheKeyPrefix}_ProductId_{entity.ProductId}");
            return inserted;
        }

        public override async Task UpdateAsync(ProductImage entity)
        {
            await base.UpdateAsync(entity);
            await _redisDatabase.KeyDeleteAsync($"{_cacheKeyPrefix}_ProductId_{entity.ProductId}");
        }

        public override async Task DeleteAsync(ProductImage entity)
        {
            await base.DeleteAsync(entity);
            await _redisDatabase.KeyDeleteAsync($"{_cacheKeyPrefix}_ProductId_{entity.ProductId}");
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
