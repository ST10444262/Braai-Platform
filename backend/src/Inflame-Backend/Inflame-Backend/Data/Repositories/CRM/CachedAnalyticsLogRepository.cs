using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CRM;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// Cached implementation of the IAnalyticsLogRepository using Redis.
    /// </summary>
    public class CachedAnalyticsLogRepository : CachedBaseRepository<AnalyticsLog>, IAnalyticsLogRepository
    {
        #region Configuration
        private readonly IAnalyticsLogRepository _innerSpecificRepository;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the CachedAnalyticsLogRepository.
        /// </summary>
        /// <param name="innerRepository">The internal repository to decorate.</param>
        /// <param name="redisInstance">The Redis instance for caching.</param>
        public CachedAnalyticsLogRepository(IAnalyticsLogRepository innerRepository, RedisInstance redisInstance)
            : base(innerRepository, redisInstance)
        {
            _innerSpecificRepository = innerRepository;
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
