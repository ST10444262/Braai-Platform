using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Models.CustomBuild;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CustomBuild
{
    /// <summary>
    /// Repository interface for CustomFireplacePart entities.
    /// </summary>
    public interface ICustomFireplacePartRepository : IBaseRepository<CustomFireplacePart>
    {
        Task<CustomFireplacePart?> GetByIdAsync(Guid id);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
