using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Models.CustomBuild;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CustomBuild
{
    /// <summary>
    /// Repository interface for CustomBraaiPart entities.
    /// </summary>
    public interface ICustomBraaiPartRepository : IBaseRepository<CustomBraaiPart>
    {
        Task<CustomBraaiPart?> GetByIdAsync(Guid id);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
