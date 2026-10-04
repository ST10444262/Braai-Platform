using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CRM;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// PostgreSQL implementation of the IEnquiryRepository.
    /// </summary>
    public class PostgresEnquiryRepository : PostgresBaseRepository<Enquiry>, IEnquiryRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresEnquiryRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresEnquiryRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
