using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CustomBuild;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CustomBuild
{
    /// <summary>
    /// Cached implementation of the ICustomBraaiPartRepository using Redis.
    /// </summary>
    public class CachedCustomBraaiPartRepository : CachedBaseRepository<CustomBraaiPart>, ICustomBraaiPartRepository
    {
        #region Configuration
        private readonly ICustomBraaiPartRepository _innerSpecificRepository;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the CachedCustomBraaiPartRepository.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedCustomBraaiPartRepository(ICustomBraaiPartRepository innerRepository, RedisInstance redisInstance)
            : base(innerRepository, redisInstance)
        {
            _innerSpecificRepository = innerRepository;
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
