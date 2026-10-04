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
        private readonly IBraaiProductRepository _braaiProductRepository;
        private readonly IFireplaceProductRepository _fireplaceProductRepository;
        private readonly IProductImageRepository _productImageRepository;

        #region Constructors

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the ProductCatalogueFacade with the required dependencies.
        /// </summary>
        /// <param name="productRepository">The repository for accessing product data.</param>
        /// <param name="braaiProductRepository">The repository for accessing braai product data.</param>
        /// <param name="fireplaceProductRepository">The repository for accessing fireplace product data.</param>
        public ProductCatalogueFacade(
            IProductRepository productRepository, 
            IBraaiProductRepository braaiProductRepository,
            IFireplaceProductRepository fireplaceProductRepository,
            IProductImageRepository productImageRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _braaiProductRepository = braaiProductRepository ?? throw new ArgumentNullException(nameof(braaiProductRepository));
            _fireplaceProductRepository = fireplaceProductRepository ?? throw new ArgumentNullException(nameof(fireplaceProductRepository));
            _productImageRepository = productImageRepository ?? throw new ArgumentNullException(nameof(productImageRepository));
        }

        #endregion

        #region Facade Methods

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves a paginated and filtered catalog of products.
        /// </summary>
        public async Task<IEnumerable<Product>> GetFilteredCatalogAsync(string? category, string? productType, string? brand, decimal? minPrice, decimal? maxPrice, string? fuelType, decimal? minHeatOutputKw, decimal? maxHeatOutputKw, string? sortBy, string? searchTerm = null, int pageNumber = 1, int pageSize = 20, bool includeHidden = false)
        {
            // Fetches from the Product Catalog Repository
            var allProducts = await _productRepository.GetAllAsync();

            IEnumerable<Guid>? allowedIds = null;

            // Handle FuelType filtering (requires BraaiProduct)
            if (!string.IsNullOrWhiteSpace(fuelType))
            {
                var braais = await _braaiProductRepository.GetAllAsync();
                allowedIds = braais.Where(b => b.FuelType.Equals(fuelType, StringComparison.OrdinalIgnoreCase))
                                   .Select(b => b.ProductId)
                                   .ToList();
            }

            // Handle HeatOutputKw filtering (requires FireplaceProduct)
            if (minHeatOutputKw.HasValue || maxHeatOutputKw.HasValue)
            {
                var fireplaces = await _fireplaceProductRepository.GetAllAsync();
                var fpQuery = fireplaces.AsEnumerable();

                if (minHeatOutputKw.HasValue)
                {
                    fpQuery = fpQuery.Where(f => f.HeatOutputKw >= minHeatOutputKw.Value);
                }

                if (maxHeatOutputKw.HasValue)
                {
                    fpQuery = fpQuery.Where(f => f.HeatOutputKw <= maxHeatOutputKw.Value);
                }

                var fpIds = fpQuery.Select(f => f.ProductId).ToList();

                // Intersect with allowedIds if FuelType was also specified (unlikely to have both, but safe)
                allowedIds = allowedIds == null ? fpIds : allowedIds.Intersect(fpIds).ToList();
            }

            // Initialize builder and convert to IQueryable for optimization
            var queryBuilder = new ProductQueryBuilder(allProducts.AsQueryable());

            // Apply Filters using the Builder
            queryBuilder
                .FilterByCategory(category)
                .FilterByProductType(productType)
                .FilterByBrand(brand)
                .FilterByPriceRange(minPrice, maxPrice)
                .FilterByProductIds(allowedIds)
                .FilterBySearchTerm(searchTerm)
                .ApplySorting(sortBy);

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

            // Populate images for the paginated products
            foreach (var product in paginatedProducts)
            {
                product.Images = await _productImageRepository.GetByProductIdAsync(product.ProductId);
            }

            return paginatedProducts;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves the specific details of a single product.
        /// </summary>
        public async Task<Product?> GetProductDetailsAsync(Guid productId)
        {
            // The facade abstracts the direct repository call from the controller
            var product = await _productRepository.GetByIdAsync(productId);
            if (product != null)
            {
                product.Images = await _productImageRepository.GetByProductIdAsync(productId);
            }
            return product;
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//