using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Models.CRM;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// Repository interface for Client entities.
    /// </summary>
    public interface IClientRepository : IBaseRepository<Client>
    {
        Task<Client?> GetByIdAsync(Guid id);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
