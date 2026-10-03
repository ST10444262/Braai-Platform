using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Inflame_Backend.Builders;
using Inflame_Backend.Models.ProductCatalog;
using Xunit;

namespace Inflame_Backend.Tests.DesignPatterns
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for the ProductQueryBuilder (Builder Pattern).
    /// Verifies that chaining multiple filter methods produces the correct,
    /// intersected result set from an in-memory IQueryable.
    /// </summary>
    public class ProductQueryBuilderTests
    {
        //----------------------------------------------------------------------------------------------//
        #region Test Data

        /// <summary>
        /// Builds a representative in-memory product catalog for use in all builder tests.
        /// </summary>
        private static IQueryable<Product> BuildTestCatalog()
        {
            return new List<Product>
            {
                new Product { ProductId = Guid.NewGuid(), Name = "Braai Master 1000", Brand = "Weber",   Category = "Freestanding", ProductType = "Braai",     Price = 5000m,  IsVisible = true  },
                new Product { ProductId = Guid.NewGuid(), Name = "Braai Pro 500",    Brand = "Weber",   Category = "Built-In",     ProductType = "Braai",     Price = 3000m,  IsVisible = true  },
                new Product { ProductId = Guid.NewGuid(), Name = "FlameBox 200",     Brand = "Jetmaster",Category = "Freestanding", ProductType = "Fireplace", Price = 8000m,  IsVisible = true  },
                new Product { ProductId = Guid.NewGuid(), Name = "InfernoX",         Brand = "Jetmaster",Category = "Built-In",     ProductType = "Fireplace", Price = 12000m, IsVisible = true  },
                new Product { ProductId = Guid.NewGuid(), Name = "HiddenItem",       Brand = "NoName",  Category = "Freestanding", ProductType = "Braai",     Price = 1000m,  IsVisible = false },
                new Product { ProductId = Guid.NewGuid(), Name = "BudgetBraai",      Brand = "Generic", Category = "Freestanding", ProductType = "Braai",     Price = 1500m,  IsVisible = true  },
            }.AsQueryable();
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Single Filter Tests

        [Fact]
        public void FilterByBrand_ShouldReturnOnlyMatchingBrand()
        {
            // Arrange
            var catalog = BuildTestCatalog();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder.FilterByBrand("Weber").Build().ToList();

            // Assert
            results.Should().HaveCount(2);
            results.Should().OnlyContain(p => p.Brand.Equals("Weber", StringComparison.OrdinalIgnoreCase));
        }

        [Fact]
        public void FilterByProductType_ShouldReturnOnlyMatchingType()
        {
            // Arrange
            var catalog = BuildTestCatalog();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder.FilterByProductType("Fireplace").Build().ToList();

            // Assert
            results.Should().HaveCount(2);
            results.Should().OnlyContain(p => p.ProductType.Equals("Fireplace", StringComparison.OrdinalIgnoreCase));
        }

        [Fact]
        public void FilterByVisibility_ShouldExcludeHiddenProducts()
        {
            // Arrange
            var catalog = BuildTestCatalog();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder.FilterByVisibility(true).Build().ToList();

            // Assert
            results.Should().NotContain(p => !p.IsVisible,
                because: "hidden products (IsVisible = false) must be excluded when filtering by visibility");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Combined Filter Tests (Critical: Price Range + Another Filter Simultaneously)

        [Fact]
        public void FilterByPriceRangeAndBrand_WhenCombined_ShouldReturnCorrectIntersection()
        {
            // Arrange – we want only Jetmaster products in the 7,000 – 15,000 range
            var catalog = BuildTestCatalog();
            var builder = new ProductQueryBuilder(catalog);

            // Act – chain both filters together
            var results = builder
                .FilterByPriceRange(7000m, 15000m)
                .FilterByBrand("Jetmaster")
                .Build()
                .ToList();

            // Assert – only FlameBox 200 (8000) and InfernoX (12000) qualify
            results.Should().HaveCount(2,
                because: "only the two Jetmaster products fall within the 7,000–15,000 price range");
            results.Should().OnlyContain(p =>
                p.Brand.Equals("Jetmaster", StringComparison.OrdinalIgnoreCase) &&
                p.Price >= 7000m && p.Price <= 15000m);
        }

        [Fact]
        public void FilterByPriceRangeAndCategory_WhenCombined_ShouldReturnCorrectIntersection()
        {
            // Arrange – Freestanding products under R6,000
            var catalog = BuildTestCatalog();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder
                .FilterByPriceRange(null, 6000m)
                .FilterByCategory("Freestanding")
                .Build()
                .ToList();

            // Assert – Braai Master 1000 (5000, Freestanding) + HiddenItem (1000) + BudgetBraai (1500)
            // FlameBox 200 costs 8000 – excluded. Built-In products excluded by category.
            results.Should().HaveCount(3);
            results.Should().OnlyContain(p =>
                p.Category.Equals("Freestanding", StringComparison.OrdinalIgnoreCase) &&
                p.Price <= 6000m);
        }

        [Fact]
        public void FilterByPriceRangeAndProductType_WhenCombined_ShouldReturnCorrectSubset()
        {
            // Arrange – only Braai products between R2,000 and R6,000
            var catalog = BuildTestCatalog();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder
                .FilterByProductType("Braai")
                .FilterByPriceRange(2000m, 6000m)
                .Build()
                .ToList();

            // Assert – Braai Master 1000 (5000) and Braai Pro 500 (3000) qualify
            results.Should().HaveCount(2);
            results.Should().OnlyContain(p =>
                p.ProductType.Equals("Braai", StringComparison.OrdinalIgnoreCase) &&
                p.Price >= 2000m && p.Price <= 6000m);
        }

        [Fact]
        public void TripleFilter_BrandCategoryAndPriceRange_ShouldReturnPreciseResult()
        {
            // Arrange – Weber, Built-In, any price
            var catalog = BuildTestCatalog();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder
                .FilterByBrand("Weber")
                .FilterByCategory("Built-In")
                .FilterByPriceRange(1000m, 5000m)
                .Build()
                .ToList();

            // Assert – only "Braai Pro 500" (Weber, Built-In, 3000) qualifies
            results.Should().ContainSingle(
                because: "only one product is Weber AND Built-In AND within the price range");
            results.Single().Name.Should().Be("Braai Pro 500");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Sorting Tests

        [Fact]
        public void ApplySorting_PriceAsc_ShouldOrderProductsByPriceAscending()
        {
            // Arrange
            var catalog = BuildTestCatalog();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder.ApplySorting("price_asc").Build().ToList();

            // Assert
            results.Should().BeInAscendingOrder(p => p.Price,
                because: "sorting by 'price_asc' must order cheapest-first");
        }

        [Fact]
        public void ApplySorting_PriceDesc_ShouldOrderProductsByPriceDescending()
        {
            // Arrange
            var catalog = BuildTestCatalog();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder.ApplySorting("price_desc").Build().ToList();

            // Assert
            results.Should().BeInDescendingOrder(p => p.Price,
                because: "sorting by 'price_desc' must order most-expensive-first");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Edge Case Tests

        [Fact]
        public void FilterByBrand_WhenBrandIsNull_ShouldReturnAllProducts()
        {
            // Arrange
            var catalog = BuildTestCatalog();
            var totalCount = catalog.Count();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder.FilterByBrand(null).Build().ToList();

            // Assert
            results.Should().HaveCount(totalCount,
                because: "a null brand filter must be treated as 'no filter applied'");
        }

        [Fact]
        public void FilterByPriceRange_WhenNoMinOrMax_ShouldReturnAllProducts()
        {
            // Arrange
            var catalog = BuildTestCatalog();
            var totalCount = catalog.Count();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder.FilterByPriceRange(null, null).Build().ToList();

            // Assert
            results.Should().HaveCount(totalCount,
                because: "null min/max price means the price filter is inactive");
        }

        [Fact]
        public void SearchByTerm_ShouldMatchProductNameCaseInsensitively()
        {
            // Arrange
            var catalog = BuildTestCatalog();
            var builder = new ProductQueryBuilder(catalog);

            // Act
            var results = builder.FilterBySearchTerm("braai").Build().ToList();

            // Assert – "Braai Master 1000", "Braai Pro 500", "BudgetBraai", "HiddenItem" (no, no match)
            results.Should().NotBeEmpty();
            results.Should().OnlyContain(p =>
                p.Name.Contains("braai", StringComparison.OrdinalIgnoreCase) ||
                p.Brand.Contains("braai", StringComparison.OrdinalIgnoreCase));
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
