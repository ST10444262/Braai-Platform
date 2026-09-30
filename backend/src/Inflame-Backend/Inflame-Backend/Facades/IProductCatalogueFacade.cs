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
        /// <param name="productType">Optional product type filter.</param>
        /// <param name="brand">Optional brand filter.</param>
        /// <param name="minPrice">Optional minimum price filter.</param>
        /// <param name="maxPrice">Optional maximum price filter.</param>
        /// <param name="fuelType">Optional fuel type filter for Braais.</param>
        /// <param name="minHeatOutputKw">Optional minimum heat output filter for Fireplaces.</param>
        /// <param name="maxHeatOutputKw">Optional maximum heat output filter for Fireplaces.</param>
        /// <param name="sortBy">Optional sort criteria (e.g. price_asc, price_desc).</param>
        /// <param name="pageNumber">The current page number (default is 1).</param>
        /// <param name="pageSize">The number of items per page (default is 20).</param>
        /// <param name="includeHidden">If true, returns all products regardless of visibility (for Admin use).</param>
        /// <returns>A collection of products matching the criteria for the specified page.</returns>
        Task<IEnumerable<Product>> GetFilteredCatalogAsync(string? category, string? productType, string? brand, decimal? minPrice, decimal? maxPrice, string? fuelType, decimal? minHeatOutputKw, decimal? maxHeatOutputKw, string? sortBy, int pageNumber = 1, int pageSize = 20, bool includeHidden = false);

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