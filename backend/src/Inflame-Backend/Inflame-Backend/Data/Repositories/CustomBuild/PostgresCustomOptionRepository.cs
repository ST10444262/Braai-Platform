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
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch a CustomOption by its unique identifier.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<CustomOption?> GetByIdAsync(Guid id)
        {
            var response = await _supabaseInstance.Client.From<CustomOption>().Where(x => x.CustomOptionId == id).Single();
            return response;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
