using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CRM;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// PostgreSQL implementation of the IAnalyticsLogRepository.
    /// </summary>
    public class PostgresAnalyticsLogRepository : PostgresBaseRepository<AnalyticsLog>, IAnalyticsLogRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresAnalyticsLogRepository.
        /// </summary>
        /// <param name="supabaseInstance">The Supabase instance for database connection.</param>
        public PostgresAnalyticsLogRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
