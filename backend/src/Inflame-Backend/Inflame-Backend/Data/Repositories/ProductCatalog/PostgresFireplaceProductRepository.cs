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
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
