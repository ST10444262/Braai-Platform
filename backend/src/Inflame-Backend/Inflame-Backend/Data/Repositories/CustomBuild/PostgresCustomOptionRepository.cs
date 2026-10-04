using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CustomBuild;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CustomBuild
{
    /// <summary>
    /// PostgreSQL implementation of the ICustomOptionRepository.
    /// </summary>
    public class PostgresCustomOptionRepository : PostgresBaseRepository<CustomOption>, ICustomOptionRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresCustomOptionRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresCustomOptionRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
