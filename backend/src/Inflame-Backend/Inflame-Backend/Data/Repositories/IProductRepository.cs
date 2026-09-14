using System;
using Inflame_Backend.Models.ProductCatalog;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace Inflame_Backend.Data.Repositories
{

    /// <summary>
    /// Contract interface defining asynchronous data operations for Products.
    /// Decouples business logic from specific database SDKs and caching layers.
    /// </summary>
    public interface IProductRepository
    {
        Task<Product?> GetByIdAsync(Guid id);
        Task<List<Product>> GetAllAsync();
        Task AddAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(Guid id); 
    }
}
//---------------------END OF FILE------------------------------------------------------------------//