using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.ProductCatalog
{
    /// <summary>
    /// Repository interface for ProductImage entities.
    /// </summary>
    public interface IProductImageRepository : IBaseRepository<ProductImage>
    {
        Task<System.Collections.Generic.List<ProductImage>> GetByProductIdAsync(Guid productId);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
