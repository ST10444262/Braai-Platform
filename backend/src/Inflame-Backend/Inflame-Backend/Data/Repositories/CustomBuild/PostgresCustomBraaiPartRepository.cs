using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CustomBuild;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CustomBuild
{
    /// <summary>
    /// PostgreSQL implementation of the ICustomBraaiPartRepository.
    /// </summary>
    public class PostgresCustomBraaiPartRepository : PostgresBaseRepository<CustomBraaiPart>, ICustomBraaiPartRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresCustomBraaiPartRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresCustomBraaiPartRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
