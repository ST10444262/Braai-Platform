using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.ProductCatalog
{
    /// <summary>
    /// PostgreSQL implementation of the IProductImageRepository.
    /// </summary>
    public class PostgresProductImageRepository : PostgresBaseRepository<ProductImage>, IProductImageRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresProductImageRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresProductImageRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch a ProductImage by its unique identifier.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<ProductImage?> GetByIdAsync(Guid id)
        {
            var response = await _supabaseInstance.Client.From<ProductImage>().Where(x => x.ImageId == id).Single();
            return response;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
