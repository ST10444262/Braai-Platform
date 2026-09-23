using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CustomBuild;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CustomBuild
{
    /// <summary>
    /// PostgreSQL implementation of the ICustomFireplacePartRepository.
    /// </summary>
    public class PostgresCustomFireplacePartRepository : PostgresBaseRepository<CustomFireplacePart>, ICustomFireplacePartRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresCustomFireplacePartRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresCustomFireplacePartRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
