using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CRM;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// Cached implementation of the IInternalNoteRepository using Redis.
    /// </summary>
    public class CachedInternalNoteRepository : CachedBaseRepository<InternalNote>, IInternalNoteRepository
    {
        #region Configuration
        private readonly IInternalNoteRepository _innerSpecificRepository;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the CachedInternalNoteRepository.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedInternalNoteRepository(IInternalNoteRepository innerRepository, RedisInstance redisInstance)
            : base(innerRepository, redisInstance)
        {
            _innerSpecificRepository = innerRepository;
        }
        #endregion
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves a InternalNote by its unique identifier, checking the cache first.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<InternalNote?> GetByIdAsync(Guid id)
        {
            string cacheKey = $"{_cacheKeyPrefix}:{id}";

            var cachedValue = await _redisDatabase.StringGetAsync(cacheKey);
            if (!cachedValue.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<InternalNote>((string)cachedValue!);
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
