using Inflame_Backend.Models.ProductCatalog;
using System;

namespace Inflame_Backend.Factories
{
    public class ProductFactory
    {
        #region Factory Methods

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Creates a specific Braai product by mapping its base product details.
        /// Handles validation to ensure a base product is provided.
        /// </summary>
        /// <param name="baseProduct">The core product details.</param>
        /// <param name="fuelType">The fuel type for the braai (e.g., Wood, Gas).</param>
        /// <param name="braaiType">The specific type of braai.</param>
        /// <returns>A correctly instantiated BraaiProduct.</returns>
        public static BraaiProduct CreateBraaiProduct(Product baseProduct, string fuelType, string braaiType)
        {
            if (baseProduct == null)
            {
                throw new ArgumentNullException(nameof(baseProduct), "Base product cannot be null when creating a Braai product.");
            }

            return new BraaiProduct
            {
                ProductId = baseProduct.ProductId,
                FuelType = fuelType,
                BraaiType = braaiType,
                BaseProduct = baseProduct
            };
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Creates a specific Fireplace product by mapping its base product details.
        /// Handles validation to ensure a base product is provided.
        /// </summary>
        /// <param name="baseProduct">The core product details.</param>
        /// <param name="heatOutputKw">The heat output in kilowatts (kW).</param>
        /// <param name="fireplaceType">The specific type of fireplace (e.g., Closed Combustion).</param>
        /// <returns>A correctly instantiated FireplaceProduct.</returns>
        public static FireplaceProduct CreateFireplaceProduct(Product baseProduct, decimal heatOutputKw, string fireplaceType)
        {
            if (baseProduct == null)
            {
                throw new ArgumentNullException(nameof(baseProduct), "Base product cannot be null when creating a Fireplace product.");
            }

            return new FireplaceProduct
            {
                ProductId = baseProduct.ProductId,
                HeatOutputKw = heatOutputKw,
                FireplaceType = fireplaceType,
                BaseProduct = baseProduct
            };
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//