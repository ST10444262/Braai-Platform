using Inflame_Backend.Models.ProductCatalog;
using System.Collections.Generic;
using System.Linq;

namespace Inflame_Backend.Builders
{
    public class ProductQueryBuilder
    {
        private IQueryable<Product> _query;

        #region Constructors

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the ProductQueryBuilder.
        /// </summary>
        /// <param name="initialQuery">The initial queryable collection of products to filter.</param>
        public ProductQueryBuilder(IQueryable<Product> initialQuery)
        {
            _query = initialQuery ?? Enumerable.Empty<Product>().AsQueryable();
        }

        #endregion

        #region Builder Methods

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Filters the products by a specific brand.
        /// </summary>
        /// <param name="brand">The brand to filter by.</param>
        /// <returns>The current ProductQueryBuilder instance.</returns>
        public ProductQueryBuilder FilterByBrand(string? brand)
        {
            if (!string.IsNullOrWhiteSpace(brand))
            {
                _query = _query.Where(p => p.Brand.Equals(brand, System.StringComparison.OrdinalIgnoreCase));
            }
            return this;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Filters the products by a specific category (e.g., free standing, built in).
        /// </summary>
        /// <param name="category">The category to filter by.</param>
        /// <returns>The current ProductQueryBuilder instance.</returns>
        public ProductQueryBuilder FilterByCategory(string? category)
        {
            if (!string.IsNullOrWhiteSpace(category))
            {
                _query = _query.Where(p => p.Category.Equals(category, System.StringComparison.OrdinalIgnoreCase));
            }
            return this;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Filters the products by a specific product type (e.g., Braai, Fireplace).
        /// </summary>
        /// <param name="productType">The product type to filter by.</param>
        /// <returns>The current ProductQueryBuilder instance.</returns>
        public ProductQueryBuilder FilterByProductType(string? productType)
        {
            if (!string.IsNullOrWhiteSpace(productType))
            {
                _query = _query.Where(p => p.ProductType.Equals(productType, System.StringComparison.OrdinalIgnoreCase));
            }
            return this;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Filters the products to include only those within a specified price range.
        /// </summary>
        /// <param name="minPrice">The minimum price (inclusive).</param>
        /// <param name="maxPrice">The maximum price (inclusive).</param>
        /// <returns>The current ProductQueryBuilder instance.</returns>
        public ProductQueryBuilder FilterByPriceRange(decimal? minPrice, decimal? maxPrice)
        {
            if (minPrice.HasValue)
            {
                _query = _query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                _query = _query.Where(p => p.Price <= maxPrice.Value);
            }
            return this;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Filters the products to include only those that are visible.
        /// </summary>
        /// <param name="isVisible">True if filtering for visible products, false otherwise. Default is true.</param>
        /// <returns>The current ProductQueryBuilder instance.</returns>
        public ProductQueryBuilder FilterByVisibility(bool isVisible = true)
        {
            _query = _query.Where(p => p.IsVisible == isVisible);
            return this;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Filters the products to include only those matching a specific list of IDs.
        /// </summary>
        /// <param name="productIds">The list of allowed product IDs.</param>
        /// <returns>The current ProductQueryBuilder instance.</returns>
        public ProductQueryBuilder FilterByProductIds(IEnumerable<System.Guid>? productIds)
        {
            if (productIds != null && productIds.Any())
            {
                _query = _query.Where(p => productIds.Contains(p.ProductId));
            }
            return this;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Applies sorting to the query based on the sort parameter.
        /// </summary>
        /// <param name="sortBy">The sorting criteria (e.g. price_asc, price_desc).</param>
        /// <returns>The current ProductQueryBuilder instance.</returns>
        public ProductQueryBuilder ApplySorting(string? sortBy)
        {
            if (string.IsNullOrWhiteSpace(sortBy))
            {
                // Default sorting could be added here if needed, for example by CreatedAt desc
                return this;
            }

            if (sortBy.Equals("price_asc", System.StringComparison.OrdinalIgnoreCase))
            {
                _query = _query.OrderBy(p => p.Price);
            }
            else if (sortBy.Equals("price_desc", System.StringComparison.OrdinalIgnoreCase))
            {
                _query = _query.OrderByDescending(p => p.Price);
            }

            return this;
        }

        #endregion

        #region Execution Methods

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Returns the constructed queryable expression.
        /// The caller should use ToListAsync() or similar to execute the query against the database.
        /// </summary>
        /// <returns>An IQueryable of products that match all applied filters.</returns>
        public IQueryable<Product> Build()
        {
            return _query;
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//