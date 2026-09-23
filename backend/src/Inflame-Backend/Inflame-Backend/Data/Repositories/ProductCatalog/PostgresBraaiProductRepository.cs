using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.ProductCatalog
{
    /// <summary>
    /// PostgreSQL implementation of the IBraaiProductRepository.
    /// </summary>
    public class PostgresBraaiProductRepository : PostgresBaseRepository<BraaiProduct>, IBraaiProductRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresBraaiProductRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresBraaiProductRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
