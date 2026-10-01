using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CRM;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// PostgreSQL implementation of the IInternalNoteRepository.
    /// </summary>
    public class PostgresInternalNoteRepository : PostgresBaseRepository<InternalNote>, IInternalNoteRepository
    {
        #region Configuration
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the PostgresInternalNoteRepository.
        /// </summary>
        /// <param name="supabaseInstance"></param>
        public PostgresInternalNoteRepository(SupabaseInstance supabaseInstance) : base(supabaseInstance)
        {
        }
        #endregion

        //------------------------------------------------------------------------------------------//
        public async Task<System.Collections.Generic.List<InternalNote>> GetByClientIdAsync(Guid clientId)
        {
            var response = await _supabaseInstance.Client
                .From<InternalNote>()
                .Filter("client_id", Supabase.Postgrest.Constants.Operator.Equals, clientId.ToString())
                .Get();

            return response.Models;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
