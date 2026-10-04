using System;
using FluentAssertions;
using Inflame_Backend.Factories;
using Inflame_Backend.Models.ProductCatalog;
using Xunit;

namespace Inflame_Backend.Tests.DesignPatterns
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for the ProductFactory (Factory Method pattern).
    /// Verifies that the factory creates the correct subclass depending on the inputs.
    /// </summary>
    public class ProductFactoryTests
    {
        //----------------------------------------------------------------------------------------------//
        #region Helpers

        /// <summary>Creates a minimal base Product with a known ID.</summary>
        private static Product BuildBaseProduct(string name = "Test Product", decimal price = 100m)
        {
            return new Product
            {
                ProductId = Guid.NewGuid(),
                Name = name,
                Price = price,
                Category = "TestCategory",
                Brand = "TestBrand",
                ProductType = "Test"
            };
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region BraaiProduct Factory Tests

        [Fact]
        public void CreateBraaiProduct_ShouldReturnBraaiProductInstance()
        {
            // Arrange
            var baseProduct = BuildBaseProduct();

            // Act
            var result = ProductFactory.CreateBraaiProduct(baseProduct, "Wood", "Open Braai");

            // Assert
            result.Should().BeOfType<BraaiProduct>(
                because: "the factory must instantiate a BraaiProduct when braai inputs are supplied");
        }

        [Fact]
        public void CreateBraaiProduct_ShouldMapPropertiesFromBaseProduct()
        {
            // Arrange
            var baseProduct = BuildBaseProduct();

            // Act
            var result = ProductFactory.CreateBraaiProduct(baseProduct, "Gas", "Built-In");

            // Assert
            result.ProductId.Should().Be(baseProduct.ProductId,
                because: "the ProductId must match the base product");
            result.FuelType.Should().Be("Gas");
            result.BraaiType.Should().Be("Built-In");
            result.BaseProduct.Should().BeSameAs(baseProduct);
        }

        [Fact]
        public void CreateBraaiProduct_WhenBaseProductIsNull_ShouldThrowArgumentNullException()
        {
            // Arrange
            Product? baseProduct = null;

            // Act
            var act = () => ProductFactory.CreateBraaiProduct(baseProduct!, "Wood", "Open");

            // Assert
            act.Should().Throw<ArgumentNullException>(
                because: "a null base product is an invalid argument that must be caught early");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region FireplaceProduct Factory Tests

        [Fact]
        public void CreateFireplaceProduct_ShouldReturnFireplaceProductInstance()
        {
            // Arrange
            var baseProduct = BuildBaseProduct();

            // Act
            var result = ProductFactory.CreateFireplaceProduct(baseProduct, 15.5m, "Closed Combustion");

            // Assert
            result.Should().BeOfType<FireplaceProduct>(
                because: "the factory must instantiate a FireplaceProduct when fireplace inputs are supplied");
        }

        [Fact]
        public void CreateFireplaceProduct_ShouldMapPropertiesFromBaseProduct()
        {
            // Arrange
            var baseProduct = BuildBaseProduct();

            // Act
            var result = ProductFactory.CreateFireplaceProduct(baseProduct, 20m, "Open Fireplace");

            // Assert
            result.ProductId.Should().Be(baseProduct.ProductId);
            result.HeatOutputKw.Should().Be(20m);
            result.FireplaceType.Should().Be("Open Fireplace");
            result.BaseProduct.Should().BeSameAs(baseProduct);
        }

        [Fact]
        public void CreateFireplaceProduct_WhenBaseProductIsNull_ShouldThrowArgumentNullException()
        {
            // Arrange
            Product? baseProduct = null;

            // Act
            var act = () => ProductFactory.CreateFireplaceProduct(baseProduct!, 10m, "Gas");

            // Assert
            act.Should().Throw<ArgumentNullException>(
                because: "a null base product must always be rejected by the factory");
        }

        #endregion

        //----------------------------------------------------------------------------------------------//
        #region Factory Differentiation Tests

        [Fact]
        public void FactoryMethods_ShouldProduceDifferentSubclasses()
        {
            // Arrange
            var braaiBase = BuildBaseProduct("Braai Product");
            var fireplaceBase = BuildBaseProduct("Fireplace Product");

            // Act
            var braaiResult = ProductFactory.CreateBraaiProduct(braaiBase, "Charcoal", "Freestanding");
            var fireplaceResult = ProductFactory.CreateFireplaceProduct(fireplaceBase, 12m, "Inbuilt");

            // Assert
            braaiResult.Should().BeOfType<BraaiProduct>();
            fireplaceResult.Should().BeOfType<FireplaceProduct>();
            braaiResult.Should().NotBeOfType<FireplaceProduct>(
                because: "a BraaiProduct must never be confused with a FireplaceProduct");
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
