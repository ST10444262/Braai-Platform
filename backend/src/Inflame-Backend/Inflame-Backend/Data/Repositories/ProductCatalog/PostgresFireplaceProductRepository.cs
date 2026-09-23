using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.ProductCatalog
{
    /// <summary>
    /// PostgreSQL implementation of the IFireplaceProductRepository.
    /// </summary>
    public class PostgresFireplaceProductRepository : PostgresBaseRepository<FireplaceProduct>, IFireplaceProductRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresFireplaceProductRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresFireplaceProductRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch a FireplaceProduct by its unique identifier.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<FireplaceProduct?> GetByIdAsync(Guid id)
        {
            var response = await _supabaseInstance.Client.From<FireplaceProduct>().Where(x => x.ProductId == id).Single();
            return response;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
