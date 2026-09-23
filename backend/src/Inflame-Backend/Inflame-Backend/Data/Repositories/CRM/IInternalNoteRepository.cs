using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Models.CRM;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// Repository interface for InternalNote entities.
    /// </summary>
    public interface IInternalNoteRepository : IBaseRepository<InternalNote>
    {
        Task<InternalNote?> GetByIdAsync(Guid id);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
