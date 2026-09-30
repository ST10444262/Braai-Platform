using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CRM;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// PostgreSQL implementation of the IInvoiceRecordRepository.
    /// </summary>
    public class PostgresInvoiceRecordRepository : PostgresBaseRepository<InvoiceRecord>, IInvoiceRecordRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresInvoiceRecordRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresInvoiceRecordRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
