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
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch a CustomBraaiPart by its unique identifier.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<CustomBraaiPart?> GetByIdAsync(Guid id)
        {
            var response = await _supabaseInstance.Client.From<CustomBraaiPart>().Where(x => x.PartId == id).Single();
            return response;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
