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
        /// <summary>
        /// Fetch a InternalNote by its unique identifier.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public async Task<InternalNote?> GetByIdAsync(Guid id)
        {
            var response = await _supabaseInstance.Client.From<InternalNote>().Where(x => x.NoteId == id).Single();
            return response;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
