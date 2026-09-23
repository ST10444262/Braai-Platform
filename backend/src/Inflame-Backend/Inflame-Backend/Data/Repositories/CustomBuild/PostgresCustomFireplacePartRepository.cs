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
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch a CustomFireplacePart by its unique identifier.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<CustomFireplacePart?> GetByIdAsync(Guid id)
        {
            var response = await _supabaseInstance.Client.From<CustomFireplacePart>().Where(x => x.PartId == id).Single();
            return response;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
