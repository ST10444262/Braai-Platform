using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.ProductCatalog
{
    /// <summary>
    /// Repository interface for Product entities.
    /// </summary>
    public interface IProductRepository : IBaseRepository<Product>
    {
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
