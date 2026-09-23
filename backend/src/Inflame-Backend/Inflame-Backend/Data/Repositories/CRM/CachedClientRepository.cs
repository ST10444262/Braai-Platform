using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CRM;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// Cached implementation of the IClientRepository using Redis.
    /// </summary>
    public class CachedClientRepository : CachedBaseRepository<Client>, IClientRepository
    {
        #region Configuration

        private readonly IClientRepository _innerSpecificRepository;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the CachedClientRepository.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedClientRepository(IClientRepository innerRepository, RedisInstance redisInstance)
            : base(innerRepository, redisInstance)
        {
            _innerSpecificRepository = innerRepository;
        }

        #endregion

    }
}
//---------------------END OF FILE------------------------------------------------------------------//
