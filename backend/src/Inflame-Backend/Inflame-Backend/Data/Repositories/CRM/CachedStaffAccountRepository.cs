using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CRM;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// Cached implementation of the IStaffAccountRepository using Redis.
    /// </summary>
    public class CachedStaffAccountRepository : CachedBaseRepository<StaffAccount>, IStaffAccountRepository
    {
        #region Configuration
        private readonly IStaffAccountRepository _innerSpecificRepository;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the CachedStaffAccountRepository.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedStaffAccountRepository(IStaffAccountRepository innerRepository, RedisInstance redisInstance)
            : base(innerRepository, redisInstance)
        {
            _innerSpecificRepository = innerRepository;
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
