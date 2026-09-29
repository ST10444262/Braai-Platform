using Inflame_Backend.Builders;
using Inflame_Backend.Data.Repositories.ProductCatalog;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Inflame_Backend.Facades
{
    /// <summary>
    /// Implementation of the Facade pattern to orchestrate product catalog retrieval operations.
    /// </summary>
    public class ProductCatalogueFacade : IProductCatalogueFacade
    {
        private readonly IProductRepository _productRepository;

        #region Constructors

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the ProductCatalogueFacade with the required dependencies.
        /// </summary>
        /// <param name="productRepository">The repository for accessing product data.</param>
        public ProductCatalogueFacade(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        #endregion

        #region Facade Methods

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves a paginated and filtered catalog of products.
        /// </summary>
        public async Task<IEnumerable<Product>> GetFilteredCatalogAsync(string? category, string? brand, decimal? minPrice, decimal? maxPrice, int pageNumber = 1, int pageSize = 20, bool includeHidden = false)
        {
            // Fetches from the Product Catalog Repository
            var allProducts = await _productRepository.GetAllAsync();

            // Initialize builder and convert to IQueryable for optimization
            var queryBuilder = new ProductQueryBuilder(allProducts.AsQueryable());

            // Apply Filters using the Builder
            queryBuilder
                .FilterByCategory(category)
                .FilterByBrand(brand)
                .FilterByPriceRange(minPrice, maxPrice);

            // Conditionally filter by visibility for public users
            if (!includeHidden)
            {
                queryBuilder.FilterByVisibility(true);
            }

            var filteredQuery = queryBuilder.Build();

            // Applies the pagination feature to handle massive scale efficiently
            var paginatedProducts = filteredQuery
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return paginatedProducts;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves the specific details of a single product.
        /// </summary>
        public async Task<Product?> GetProductDetailsAsync(Guid productId)
        {
            // The facade abstracts the direct repository call from the controller
            return await _productRepository.GetByIdAsync(productId);
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//