using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.ProductCatalog
{
    /// <summary>
    /// Cached implementation of the IBraaiProductRepository using Redis.
    /// </summary>
    public class CachedBraaiProductRepository : CachedBaseRepository<BraaiProduct>, IBraaiProductRepository
    {
        #region Configuration
        private readonly IBraaiProductRepository _innerSpecificRepository;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the CachedBraaiProductRepository.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedBraaiProductRepository(IBraaiProductRepository innerRepository, RedisInstance redisInstance)
            : base(innerRepository, redisInstance)
        {
            _innerSpecificRepository = innerRepository;
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
