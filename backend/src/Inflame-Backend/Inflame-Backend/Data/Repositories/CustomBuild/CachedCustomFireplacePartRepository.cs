using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CustomBuild;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CustomBuild
{
    /// <summary>
    /// Cached implementation of the ICustomFireplacePartRepository using Redis.
    /// </summary>
    public class CachedCustomFireplacePartRepository : CachedBaseRepository<CustomFireplacePart>, ICustomFireplacePartRepository
    {
        #region Configuration
        private readonly ICustomFireplacePartRepository _innerSpecificRepository;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the CachedCustomFireplacePartRepository.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedCustomFireplacePartRepository(ICustomFireplacePartRepository innerRepository, RedisInstance redisInstance)
            : base(innerRepository, redisInstance)
        {
            _innerSpecificRepository = innerRepository;
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
