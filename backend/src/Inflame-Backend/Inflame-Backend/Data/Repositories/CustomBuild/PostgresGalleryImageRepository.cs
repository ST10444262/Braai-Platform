using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CustomBuild;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CustomBuild
{
    /// <summary>
    /// PostgreSQL implementation of the IGalleryImageRepository.
    /// </summary>
    public class PostgresGalleryImageRepository : PostgresBaseRepository<GalleryImage>, IGalleryImageRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresGalleryImageRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresGalleryImageRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch a GalleryImage by its unique identifier.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<GalleryImage?> GetByIdAsync(Guid id)
        {
            var response = await _supabaseInstance.Client.From<GalleryImage>().Where(x => x.PhotoId == id).Single();
            return response;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
