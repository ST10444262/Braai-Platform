using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Models.CustomBuild;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CustomBuild
{
    /// <summary>
    /// Repository interface for GalleryImage entities.
    /// </summary>
    public interface IGalleryImageRepository : IBaseRepository<GalleryImage>
    {
        Task<GalleryImage?> GetByIdAsync(Guid id);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
