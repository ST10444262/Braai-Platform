using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Inflame_Backend.Facades;
using Inflame_Backend.Features.Product.DTOs;
using Inflame_Backend.Features.Product.Queries;
using Inflame_Backend.Models.ProductCatalog;
using Moq;
using Xunit;

namespace Inflame_Backend.Tests.ApplicationLayer
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for MediatR Query Handlers (read operations).
    /// Verifies that queries correctly delegate to the Facade and that returned
    /// data is safely mapped to DTOs without exposing sensitive fields.
    /// </summary>
    public class QueryHandlerTests
    {
        //----------------------------------------------------------------------------------------------//
        #region GetProductQueryHandler Tests

        private static GetProductQueryHandler BuildHandler(Mock<IProductCatalogueFacade> mockFacade)
        {
            return new GetProductQueryHandler(mockFacade.Object);
        }

        //----------------------------------------------------------------------------------------------//
        [Fact]
        public async Task GetProductQuery_WhenProductIdProvided_ShouldReturnSingleProduct()
        {
            // Arrange
            var productId = Guid.NewGuid();
            var expectedProduct = new Product
            {
                ProductId = productId,
                Name = "Braai Master 1000",
                Price = 5000m,
                Category = "Freestanding",
                Brand = "Weber",
                ProductType = "Braai",
                IsVisible = true
            };

            var mockFacade = new Mock<IProductCatalogueFacade>();
            mockFacade
                .Setup(f => f.GetProductDetailsAsync(productId))
                .ReturnsAsync(expectedProduct);

            var handler = BuildHandler(mockFacade);
            var query = new GetProductQuery { ProductId = productId };

            // Act
            var results = new List<Product>(await handler.Handle(query, CancellationToken.None));

            // Assert
            results.Should().ContainSingle(
                because: "querying by a specific ProductId must return exactly one product");
            results[0].ProductId.Should().Be(productId);
            results[0].Name.Should().Be("Braai Master 1000");

            // The facade must be used, not a direct repository call
            mockFacade.Verify(f => f.GetProductDetailsAsync(productId), Times.Once,
                "The handler must delegate to the facade for single-product retrieval");
            mockFacade.Verify(
                f => f.GetFilteredCatalogAsync(
                    It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(),
                    It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string?>(),
                    It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string?>(),
                    It.IsAny<string?>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<bool>()),
                Times.Never,
                "The catalog query must NOT be called when fetching a single product by ID");
        }

        //----------------------------------------------------------------------------------------------//
        [Fact]
        public async Task GetProductQuery_WhenProductIdNotFound_ShouldReturnEmptyList()
        {
            // Arrange
            var productId = Guid.NewGuid();

            var mockFacade = new Mock<IProductCatalogueFacade>();
            mockFacade
                .Setup(f => f.GetProductDetailsAsync(productId))
                .ReturnsAsync((Product?)null);

            var handler = BuildHandler(mockFacade);
            var query = new GetProductQuery { ProductId = productId };

            // Act
            var results = new List<Product>(await handler.Handle(query, CancellationToken.None));

            // Assert
            results.Should().BeEmpty(
                because: "when the product is not found, an empty collection must be returned instead of null");
        }

        //----------------------------------------------------------------------------------------------//
        [Fact]
        public async Task GetProductQuery_WhenNoCriteriaProvided_ShouldCallGetFilteredCatalog()
        {
            // Arrange
            var mockFacade = new Mock<IProductCatalogueFacade>();
            var products = new List<Product>
            {
                new Product { ProductId = Guid.NewGuid(), Name = "A",  Price = 1000m, IsVisible = true },
                new Product { ProductId = Guid.NewGuid(), Name = "B",  Price = 2000m, IsVisible = true },
            };

            mockFacade
                .Setup(f => f.GetFilteredCatalogAsync(
                    It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<string?>(),
                    It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string?>(),
                    It.IsAny<decimal?>(), It.IsAny<decimal?>(), It.IsAny<string?>(),
                    It.IsAny<string?>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<bool>()))
                .ReturnsAsync(products);

            var handler = BuildHandler(mockFacade);
            var query = new GetProductQuery(); // no ProductId → catalog mode

            // Act
            var results = new List<Product>(await handler.Handle(query, CancellationToken.None));

            // Assert
            results.Should().HaveCount(2);
            mockFacade.Verify(
                f => f.GetFilteredCatalogAsync(
                    null, null, null, null, null, null, null, null, null, null, 1, 20, false),
                Times.Once,
                "The handler must delegate to GetFilteredCatalogAsync when no ProductId is specified");
        }

        //----------------------------------------------------------------------------------------------//
        #region DTO Mapping Safety Tests

        [Fact]
        public void ProductResponseDto_ShouldMapPublicFieldsAndNotExposeInternalFields()
        {
            // Arrange – simulate what the handler would map
            var entity = new Product
            {
                ProductId = Guid.NewGuid(),
                Name = "Test Product",
                Category = "Freestanding",
                ProductType = "Braai",
                Brand = "Weber",
                IsImported = false,
                IsCustomisable = true,
                Price = 4500m,
                OnSpecial = 4000m,
                Description = "Great product",
                IsVisible = true,  // internal visibility flag – must NOT appear in the response DTO
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Act
            var dto = new ProductResponseDto(entity);

            // Assert – public catalog fields are present
            dto.Id.Should().Be(entity.ProductId);
            dto.Name.Should().Be("Test Product");
            dto.Category.Should().Be("Freestanding");
            dto.Brand.Should().Be("Weber");
            dto.Price.Should().Be(4500m);
            dto.OnSpecial.Should().Be(4000m);
            dto.Description.Should().Be("Great product");

            // Assert – sensitive / internal fields are NOT present on the DTO
            // (compile-time check: these properties simply don't exist on ProductResponseDto)
            var dtoType = dto.GetType();
            dtoType.GetProperty("IsVisible").Should().BeNull(
                because: "IsVisible is an internal admin field and must not be exposed in the public response DTO");
            dtoType.GetProperty("CreatedAt").Should().BeNull(
                because: "CreatedAt is an internal audit field and must not be exposed in the public response DTO");
            dtoType.GetProperty("UpdatedAt").Should().BeNull(
                because: "UpdatedAt is an internal audit field and must not be exposed in the public response DTO");
        }

        #endregion

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
