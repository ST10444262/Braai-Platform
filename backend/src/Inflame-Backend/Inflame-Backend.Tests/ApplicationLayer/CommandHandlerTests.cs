using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Inflame_Backend.Data.Adapters;
using Inflame_Backend.Data.Repositories.ProductCatalog;
using Inflame_Backend.Features.Product.Commands;
using Inflame_Backend.Features.Product.DTOs;
using Inflame_Backend.Models.ProductCatalog;
using Moq;
using Xunit;

namespace Inflame_Backend.Tests.ApplicationLayer
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for MediatR Command Handlers (write operations).
    /// Covers:
    ///   1. Validation rejection of invalid input data before reaching the repository.
    ///   2. Successful commands correctly mapping DTO → Entity and calling the repository.
    /// </summary>
    public class CommandHandlerTests
    {
        //----------------------------------------------------------------------------------------------//
        #region UpdateProductCommand Handler Tests

        private static (UpdateProductCommandHandler handler,
                        Mock<IProductRepository> mockProductRepo,
                        Mock<IBraaiProductRepository> mockBraaiRepo,
                        Mock<IFireplaceProductRepository> mockFireplaceRepo)
            BuildUpdateHandlerWithProduct(Product? existingProduct = null)
        {
            var mockProductRepo    = new Mock<IProductRepository>();
            var mockBraaiRepo      = new Mock<IBraaiProductRepository>();
            var mockFireplaceRepo  = new Mock<IFireplaceProductRepository>();

            mockProductRepo
                .Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync(existingProduct);

            mockBraaiRepo
                .Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync((BraaiProduct?)null);

            mockFireplaceRepo
                .Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync((FireplaceProduct?)null);

            var handler = new UpdateProductCommandHandler(
                mockProductRepo.Object,
                mockBraaiRepo.Object,
                mockFireplaceRepo.Object);

            return (handler, mockProductRepo, mockBraaiRepo, mockFireplaceRepo);
        }

        //----------------------------------------------------------------------------------------------//
        [Fact]
        public async Task UpdateProductCommand_WhenProductDoesNotExist_ShouldReturnFailureWithoutCallingUpdate()
        {
            // Arrange – repository returns null → product not found
            var (handler, mockProductRepo, _, _) = BuildUpdateHandlerWithProduct(existingProduct: null);
            var productId = Guid.NewGuid();

            var dto = new UpdateProductRequestDto
            {
                Name = "Updated Name",
                Price = 999m,
                Category = "Freestanding",
                Brand = "Weber",
                Description = "Some description"
            };

            // UpdateProductCommand is a positional record: (Guid ProductId, UpdateProductRequestDto RequestDto, bool HasPriceControl)
            var command = new UpdateProductCommand(productId, dto, true);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert – validation failure: product not found
            result.Success.Should().BeFalse(
                because: "updating a non-existent product must return a failure response");
            result.Message.Should().Contain("not found");

            // Critical: UpdateAsync must never be called when validation fails
            mockProductRepo.Verify(
                r => r.UpdateAsync(It.IsAny<Product>()),
                Times.Never,
                "UpdateAsync must not be called when the product does not exist");
        }

        //----------------------------------------------------------------------------------------------//
        [Fact]
        public async Task UpdateProductCommand_WhenEmployeeTryingToChangePrice_ShouldReturnPermissionDenied()
        {
            // Arrange – employee (HasPriceControl = false) tries to change the price
            var existingProduct = new Product
            {
                ProductId    = Guid.NewGuid(),
                Name         = "Original Name",
                Price        = 5000m,
                Category     = "Test",
                Brand        = "Test",
                Description  = "Test"
            };

            var (handler, mockProductRepo, _, _) = BuildUpdateHandlerWithProduct(existingProduct);

            var dto = new UpdateProductRequestDto
            {
                Name        = "Updated Name",
                Price       = 6000m, // different price – employee not allowed
                Category    = "Test",
                Brand       = "Test",
                Description = "Test"
            };

            var command = new UpdateProductCommand(existingProduct.ProductId, dto, false); // false = employee

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Success.Should().BeFalse(
                because: "employees must not be allowed to change prices");
            result.Message.Should().Contain("Permission Denied",
                because: "the error message must clearly state the RBAC reason");

            mockProductRepo.Verify(
                r => r.UpdateAsync(It.IsAny<Product>()),
                Times.Never,
                "Repository must never be updated when RBAC validation fails");
        }

        //----------------------------------------------------------------------------------------------//
        [Fact]
        public async Task UpdateProductCommand_WhenValidAndAdmin_ShouldMapDtoToEntityAndCallUpdateAsync()
        {
            // Arrange – admin has full price control
            var existingProduct = new Product
            {
                ProductId   = Guid.NewGuid(),
                Name        = "Old Name",
                Price       = 5000m,
                Category    = "Freestanding",
                Brand       = "Weber",
                Description = "Old description"
            };

            var (handler, mockProductRepo, _, _) = BuildUpdateHandlerWithProduct(existingProduct);

            Product? capturedEntity = null;
            mockProductRepo
                .Setup(r => r.UpdateAsync(It.IsAny<Product>()))
                .Callback<Product>(p => capturedEntity = p)
                .Returns(Task.CompletedTask);

            var dto = new UpdateProductRequestDto
            {
                Name          = "New Name",
                Price         = 7500m,
                Category      = "Built-In",
                Brand         = "Jetmaster",
                Description   = "Updated description",
                IsVisible     = true,
                IsImported    = false,
                IsCustomisable = true
            };

            var command = new UpdateProductCommand(existingProduct.ProductId, dto, true); // true = admin

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert – success
            result.Success.Should().BeTrue();

            // Repository called once
            mockProductRepo.Verify(
                r => r.UpdateAsync(It.IsAny<Product>()),
                Times.Once,
                "A successful update must call UpdateAsync exactly once");

            // DTO fields correctly mapped to the entity
            capturedEntity.Should().NotBeNull();
            capturedEntity!.Name.Should().Be("New Name",
                because: "the Name field must be mapped from the DTO");
            capturedEntity.Price.Should().Be(7500m,
                because: "the Price field must be mapped from the DTO when the admin has price control");
            capturedEntity.Brand.Should().Be("Jetmaster");
            capturedEntity.Category.Should().Be("Built-In");
            capturedEntity.Description.Should().Be("Updated description");
        }

        //----------------------------------------------------------------------------------------------//
        [Fact]
        public async Task UpdateProductCommand_WhenEmployeeAndPriceUnchanged_ShouldSucceedAndCallUpdateAsync()
        {
            // Arrange – employee; price stays the same so permission is granted
            var existingProduct = new Product
            {
                ProductId   = Guid.NewGuid(),
                Name        = "Original",
                Price       = 5000m,
                Category    = "Freestanding",
                Brand       = "Weber",
                Description = "Desc"
            };

            var (handler, mockProductRepo, _, _) = BuildUpdateHandlerWithProduct(existingProduct);

            mockProductRepo
                .Setup(r => r.UpdateAsync(It.IsAny<Product>()))
                .Returns(Task.CompletedTask);

            var dto = new UpdateProductRequestDto
            {
                Name        = "Updated Name",
                Price       = 5000m,   // unchanged price – employee is allowed
                Category    = "Freestanding",
                Brand       = "Weber",
                Description = "New desc"
            };

            var command = new UpdateProductCommand(existingProduct.ProductId, dto, false); // employee

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Success.Should().BeTrue(
                because: "an employee CAN update non-price fields and should succeed");

            mockProductRepo.Verify(
                r => r.UpdateAsync(It.IsAny<Product>()),
                Times.Once,
                "UpdateAsync must be called exactly once for a valid employee update");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region CreateProductCommand Handler Tests

        [Fact]
        public async Task CreateProductCommand_WithBraaiProductType_ShouldCallBraaiRepositoryAddAsync()
        {
            // Arrange
            var mockProductRepo   = new Mock<IProductRepository>();
            var mockBraaiRepo     = new Mock<IBraaiProductRepository>();
            var mockFireplaceRepo = new Mock<IFireplaceProductRepository>();
            var mockImageRepo     = new Mock<IProductImageRepository>();
            var mockStorage       = new Mock<IStorageAdapter>();

            mockProductRepo.Setup(r => r.AddAsync(It.IsAny<Product>())).Returns(Task.CompletedTask);
            mockBraaiRepo.Setup(r => r.AddAsync(It.IsAny<BraaiProduct>())).Returns(Task.CompletedTask);

            var handler = new CreateProductCommandHandler(
                mockProductRepo.Object,
                mockBraaiRepo.Object,
                mockFireplaceRepo.Object,
                mockImageRepo.Object,
                mockStorage.Object);

            var dto = new CreateProductRequestDto
            {
                Name        = "Braai Beast",
                Category    = "Freestanding",
                Brand       = "Weber",
                Price       = 4500m,
                Description = "A great braai",
                ProductType = "Braai",
                FuelType    = "Charcoal",
                BraaiType   = "Open Braai",
                IsVisible   = true
            };

            var command = new CreateProductCommand(dto);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Success.Should().BeTrue();
            result.ProductId.Should().NotBeNull();

            // Base product added
            mockProductRepo.Verify(
                r => r.AddAsync(It.IsAny<Product>()),
                Times.Once,
                "The base Product must always be saved");

            // Braai subtype added
            mockBraaiRepo.Verify(
                r => r.AddAsync(It.IsAny<BraaiProduct>()),
                Times.Once,
                "A Braai product type must trigger the BraaiProduct repository");

            // Fireplace subtype NOT added
            mockFireplaceRepo.Verify(
                r => r.AddAsync(It.IsAny<FireplaceProduct>()),
                Times.Never,
                "A Braai product type must NOT trigger the Fireplace repository");
        }

        [Fact]
        public async Task CreateProductCommand_WithFireplaceProductType_ShouldCallFireplaceRepositoryAddAsync()
        {
            // Arrange
            var mockProductRepo   = new Mock<IProductRepository>();
            var mockBraaiRepo     = new Mock<IBraaiProductRepository>();
            var mockFireplaceRepo = new Mock<IFireplaceProductRepository>();
            var mockImageRepo     = new Mock<IProductImageRepository>();
            var mockStorage       = new Mock<IStorageAdapter>();

            mockProductRepo.Setup(r => r.AddAsync(It.IsAny<Product>())).Returns(Task.CompletedTask);
            mockFireplaceRepo.Setup(r => r.AddAsync(It.IsAny<FireplaceProduct>())).Returns(Task.CompletedTask);

            var handler = new CreateProductCommandHandler(
                mockProductRepo.Object,
                mockBraaiRepo.Object,
                mockFireplaceRepo.Object,
                mockImageRepo.Object,
                mockStorage.Object);

            var dto = new CreateProductRequestDto
            {
                Name          = "InfernoX",
                Category      = "Built-In",
                Brand         = "Jetmaster",
                Price         = 12000m,
                Description   = "Premium fireplace",
                ProductType   = "Fireplace",
                HeatOutputKw  = 15m,
                FireplaceType = "Closed Combustion",
                IsVisible     = true
            };

            var command = new CreateProductCommand(dto);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Success.Should().BeTrue();

            mockProductRepo.Verify(
                r => r.AddAsync(It.IsAny<Product>()),
                Times.Once,
                "Base product must always be saved");

            mockFireplaceRepo.Verify(
                r => r.AddAsync(It.IsAny<FireplaceProduct>()),
                Times.Once,
                "A Fireplace product type must trigger the FireplaceProduct repository");

            mockBraaiRepo.Verify(
                r => r.AddAsync(It.IsAny<BraaiProduct>()),
                Times.Never,
                "A Fireplace product type must NOT trigger the Braai repository");
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
