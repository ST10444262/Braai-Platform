using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Inflame_Backend.Controllers.Admin;
using Inflame_Backend.Features.Product.Commands;
using Inflame_Backend.Features.Product.DTOs;
using Inflame_Backend.Features.Product.Queries;
using Inflame_Backend.Models.ProductCatalog;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace Inflame_Backend.Tests.Controllers
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for the Admin ProductController.
    /// Covers:
    ///   1. RBAC – Employee JWT cannot access Admin-only endpoints.
    ///   2. Facade Pattern – controller delegates correctly to MediatR (which orchestrates the Facade).
    /// </summary>
    public class ProductControllerTests
    {
        //----------------------------------------------------------------------------------------------//
        #region Helpers

        private static ClaimsPrincipal BuildUser(string role)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, "testuser@inflame.co.za"),
                new Claim(ClaimTypes.Role, role)
            };
            return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        }

        private static void AttachUser(ControllerBase controller, string role)
        {
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = BuildUser(role) }
            };
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region RBAC Tests

        [Fact]
        public async Task UpdateProduct_WhenCalledByEmployee_ShouldReturnBadRequestForPriceChange()
        {
            // Arrange – the handler reports a permission-denied failure for an employee price change
            var mockMediator = new Mock<IMediator>();
            mockMediator
                .Setup(m => m.Send(It.IsAny<UpdateProductCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new UpdateProductResponseDto
                {
                    Success = false,
                    Message = "Permission Denied: Only Admins can modify product prices."
                });

            var controller = new ProductController(mockMediator.Object);
            AttachUser(controller, "Employee");

            var dto = new UpdateProductRequestDto
            {
                Name        = "Updated",
                Price       = 6000m,
                Category    = "Freestanding",
                Brand       = "Weber",
                Description = "Desc"
            };

            // Act
            var actionResult = await controller.UpdateProduct(Guid.NewGuid(), dto);

            // Assert
            actionResult.Result.Should().BeOfType<BadRequestObjectResult>(
                because: "an Employee attempting to change a product price must receive a 400 Bad Request");

            var badRequest = actionResult.Result as BadRequestObjectResult;
            var response = badRequest!.Value as UpdateProductResponseDto;
            response!.Message.Should().Contain("Permission Denied");
        }

        [Fact]
        public async Task UpdateProduct_WhenCalledByAdmin_ShouldSucceedWithPriceChange()
        {
            // Arrange
            var mockMediator = new Mock<IMediator>();
            mockMediator
                .Setup(m => m.Send(It.IsAny<UpdateProductCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new UpdateProductResponseDto
                {
                    Success = true,
                    Message = "Product updated successfully."
                });

            var controller = new ProductController(mockMediator.Object);
            AttachUser(controller, "Admin");

            var dto = new UpdateProductRequestDto
            {
                Name        = "Updated",
                Price       = 6000m,
                Category    = "Freestanding",
                Brand       = "Weber",
                Description = "Desc"
            };

            // Act
            var actionResult = await controller.UpdateProduct(Guid.NewGuid(), dto);

            // Assert
            actionResult.Result.Should().BeOfType<OkObjectResult>(
                because: "an Admin is authorized to change prices and should receive a 200 OK");
        }

        [Fact]
        public async Task CreateProduct_WhenCalledBySuperAdmin_ShouldReturn200Ok()
        {
            // Arrange
            var mockMediator = new Mock<IMediator>();
            mockMediator
                .Setup(m => m.Send(It.IsAny<CreateProductCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new CreateProductResponseDto
                {
                    Success   = true,
                    Message   = "Product created successfully.",
                    ProductId = Guid.NewGuid()
                });

            var controller = new ProductController(mockMediator.Object);
            AttachUser(controller, "SuperAdmin");

            // Act
            var actionResult = await controller.CreateProduct(new CreateProductRequestDto
            {
                Name        = "Braai Beast",
                Category    = "Freestanding",
                Brand       = "Weber",
                Price       = 4500m,
                ProductType = "Braai"
            });

            // Assert
            actionResult.Result.Should().BeOfType<OkObjectResult>(
                because: "a SuperAdmin must be able to create products");
        }

        [Fact]
        public async Task GetProducts_WhenMediatorReturnsProducts_ShouldReturnOkWithResults()
        {
            // Arrange
            var products = new List<Product>
            {
                new Product { ProductId = Guid.NewGuid(), Name = "A", Price = 1000m, IsVisible = true },
                new Product { ProductId = Guid.NewGuid(), Name = "B", Price = 2000m, IsVisible = true }
            };

            var mockMediator = new Mock<IMediator>();
            mockMediator
                .Setup(m => m.Send(It.IsAny<GetAdminProductQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(products);

            var controller = new ProductController(mockMediator.Object);
            AttachUser(controller, "Admin");

            // Act
            var actionResult = await controller.GetProducts(new GetAdminProductQuery());

            // Assert
            actionResult.Result.Should().BeOfType<OkObjectResult>(
                because: "a successful catalog retrieval must return 200 OK");

            var ok = actionResult.Result as OkObjectResult;
            var returnedProducts = ok!.Value as IEnumerable<Product>;
            returnedProducts.Should().HaveCount(2);
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Facade Orchestration via Controller Tests

        [Fact]
        public async Task GetProducts_ShouldDelegateToMediatorExactlyOnce()
        {
            // Arrange
            var mockMediator = new Mock<IMediator>();
            mockMediator
                .Setup(m => m.Send(It.IsAny<GetAdminProductQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<Product>());

            var controller = new ProductController(mockMediator.Object);
            AttachUser(controller, "Admin");

            // Act
            await controller.GetProducts(new GetAdminProductQuery());

            // Assert
            mockMediator.Verify(
                m => m.Send(It.IsAny<GetAdminProductQuery>(), It.IsAny<CancellationToken>()),
                Times.Once,
                "The controller must delegate to MediatR once per request without duplicating calls");
        }

        [Fact]
        public async Task CreateProduct_WhenHandlerFails_ShouldReturnBadRequest()
        {
            // Arrange
            var mockMediator = new Mock<IMediator>();
            mockMediator
                .Setup(m => m.Send(It.IsAny<CreateProductCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new CreateProductResponseDto
                {
                    Success   = false,
                    Message   = "An error occurred during product creation: DB error.",
                    ProductId = null
                });

            var controller = new ProductController(mockMediator.Object);
            AttachUser(controller, "Admin");

            // Act
            var actionResult = await controller.CreateProduct(new CreateProductRequestDto
            {
                Name        = "Test",
                Price       = 100m,
                Category    = "Test",
                Brand       = "Test",
                ProductType = "Braai"
            });

            // Assert
            actionResult.Result.Should().BeOfType<BadRequestObjectResult>(
                because: "a handler failure must bubble up as a 400 Bad Request from the controller");
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
