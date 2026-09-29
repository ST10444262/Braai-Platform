using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inflame_Backend.Facades
{
    /// <summary>
    /// Acts as a Facade to simplify interactions between the API controllers and the underlying product data/business logic.
    /// </summary>
    public interface IProductCatalogueFacade
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves a filtered catalog of products.
        /// </summary>
        /// <param name="category">Optional category filter.</param>
        /// <param name="brand">Optional brand filter.</param>
        /// <param name="minPrice">Optional minimum price filter.</param>
        /// <param name="maxPrice">Optional maximum price filter.</param>
        /// <returns>A collection of products matching the criteria.</returns>
        Task<IEnumerable<Product>> GetFilteredCatalogAsync(string? category, string? brand, decimal? minPrice, decimal? maxPrice);

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves the specific details of a single product.
        /// </summary>
        /// <param name="productId">The unique identifier of the product.</param>
        /// <returns>The product details, or null if not found.</returns>
        Task<Product?> GetProductDetailsAsync(Guid productId);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//