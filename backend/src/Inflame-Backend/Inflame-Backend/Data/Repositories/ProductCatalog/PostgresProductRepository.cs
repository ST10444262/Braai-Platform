using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.ProductCatalog
{
    /// <summary>
    /// PostgreSQL implementation of the IProductRepository.
    /// </summary>
    public class PostgresProductRepository : PostgresBaseRepository<Product>, IProductRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresProductRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresProductRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
