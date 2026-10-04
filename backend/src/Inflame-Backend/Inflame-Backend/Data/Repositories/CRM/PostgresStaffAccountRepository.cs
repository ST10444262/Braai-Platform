using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CRM;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// PostgreSQL implementation of the IStaffAccountRepository.
    /// </summary>
    public class PostgresStaffAccountRepository : PostgresBaseRepository<StaffAccount>, IStaffAccountRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresStaffAccountRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresStaffAccountRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
