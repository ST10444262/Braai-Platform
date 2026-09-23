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
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Fetch a Enquiry by its unique identifier.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<Enquiry?> GetByIdAsync(Guid id)
        {
            var response = await _supabaseInstance.Client.From<Enquiry>().Where(x => x.EnquiryId == id).Single();
            return response;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
