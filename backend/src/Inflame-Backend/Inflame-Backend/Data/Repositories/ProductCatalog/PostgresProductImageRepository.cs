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
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
