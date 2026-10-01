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
        public async Task<System.Collections.Generic.List<InternalNote>> GetByClientIdAsync(Guid clientId)
        {
            var cacheKey = $"internal_note_client_{clientId}";
            var cachedData = await _redisDatabase.StringGetAsync(cacheKey);

            if (!cachedData.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<System.Collections.Generic.List<InternalNote>>((string)cachedData!) ?? new System.Collections.Generic.List<InternalNote>();
            }

            var notes = await _innerSpecificRepository.GetByClientIdAsync(clientId);

            if (notes != null && notes.Count > 0)
            {
                var serializedData = JsonSerializer.Serialize(notes);
                await _redisDatabase.StringSetAsync(cacheKey, serializedData, TimeSpan.FromMinutes(30));
            }

            return notes ?? new System.Collections.Generic.List<InternalNote>();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
