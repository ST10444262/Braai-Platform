using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.ProductCatalog
{
    /// <summary>
    /// Repository interface for FireplaceProduct entities.
    /// </summary>
    public interface IFireplaceProductRepository : IBaseRepository<FireplaceProduct>
    {
        Task<FireplaceProduct?> GetByIdAsync(Guid id);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
