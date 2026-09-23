using Inflame_Backend.Data.Instances;
using StackExchange.Redis;
using Supabase.Postgrest.Models;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.DataLayer
{
    /// <summary>
    /// Generic caching decorator implementing IBaseRepository around Upstash Redis.
    /// Intercepts read queries to fetch cached JSON from Upstash Redis, falling back to Supabase on misses.
    /// </summary>
    /// <typeparam name="T">The model type, which must inherit from BaseModel</typeparam>
    public class CachedBaseRepository<T> : IBaseRepository<T> where T : BaseModel, new()
    {
        #region Configuration
        protected readonly IBaseRepository<T> _innerRepository;
        protected readonly IDatabase _redisDatabase;
        protected static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(5);
        protected readonly string _cacheKeyPrefix;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Injects the interface and the RedisInstance into the CachedBaseRepository constructor.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedBaseRepository(IBaseRepository<T> innerRepository, RedisInstance redisInstance)
        {
            _innerRepository = innerRepository;
            _redisDatabase = redisInstance.GetDatabase();
            _cacheKeyPrefix = typeof(T).Name.ToLower();
        }
        #endregion
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves all entities of type T, first checking the Redis cache before querying the underlying repository.
        /// </summary>
        /// <returns></returns>
        public async Task<List<T>> GetAllAsync()
        {
            string cacheKey = $"{_cacheKeyPrefix}:all";

            RedisValue cachedValues = await _redisDatabase.StringGetAsync(cacheKey);
            if (!cachedValues.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<List<T>>((string)cachedValues!) ?? new List<T>();
            }

            var entities = await _innerRepository.GetAllAsync();

            if (entities != null && entities.Count > 0)
            {
                string serialized = JsonSerializer.Serialize(entities);
                await _redisDatabase.StringSetAsync(cacheKey, serialized, CacheExpiration);
            }

            return entities ?? new List<T>();
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves an entity by its unique identifier, checking the cache first.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<T?> GetByIdAsync(Guid id)
        {
            string cacheKey = $"{_cacheKeyPrefix}:{id}";

            var cachedValue = await _redisDatabase.StringGetAsync(cacheKey);
            if (!cachedValue.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<T>((string)cachedValue!);
            }

            var entity = await _innerRepository.GetByIdAsync(id);

            if (entity != null)
            {
                string serialized = JsonSerializer.Serialize(entity);
                await _redisDatabase.StringSetAsync(cacheKey, serialized, CacheExpiration);
            }

            return entity;
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Adds a new entity to the underlying repository and invalidates the relevant cache entries in Redis.
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public async Task AddAsync(T entity)
        {
            await _innerRepository.AddAsync(entity);
            await _redisDatabase.KeyDeleteAsync($"{_cacheKeyPrefix}:all");
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Updates an existing entity in the underlying repository and invalidates the relevant cache entries in Redis.
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public async Task UpdateAsync(T entity)
        {
            await _innerRepository.UpdateAsync(entity);
            await _redisDatabase.KeyDeleteAsync($"{_cacheKeyPrefix}:all");
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Deletes an entity from the underlying repository and invalidates the relevant cache entries in Redis.
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public async Task DeleteAsync(T entity)
        {
            await _innerRepository.DeleteAsync(entity);
            await _redisDatabase.KeyDeleteAsync($"{_cacheKeyPrefix}:all");
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//