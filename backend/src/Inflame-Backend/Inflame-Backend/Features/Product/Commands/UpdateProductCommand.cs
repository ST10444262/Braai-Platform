using Inflame_Backend.Data.Repositories.ProductCatalog;
using Inflame_Backend.Features.Product.DTOs;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Product.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Command to update an existing product.
    /// </summary>
    public record UpdateProductCommand(Guid ProductId, UpdateProductRequestDto RequestDto, bool HasPriceControl) : IRequest<UpdateProductResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the product update process.
    /// </summary>
    public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, UpdateProductResponseDto>
    {
        private readonly IProductRepository _productRepository;
        private readonly IBraaiProductRepository _braaiProductRepository;
        private readonly IFireplaceProductRepository _fireplaceProductRepository;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the handler with the required repositories.
        /// </summary>
        public UpdateProductCommandHandler(
            IProductRepository productRepository,
            IBraaiProductRepository braaiProductRepository,
            IFireplaceProductRepository fireplaceProductRepository)
        {
            _productRepository = productRepository;
            _braaiProductRepository = braaiProductRepository;
            _fireplaceProductRepository = fireplaceProductRepository;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Executes the update of a base product and optionally its subtype.
        /// </summary>
        public async Task<UpdateProductResponseDto> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
        {
            var dto = request.RequestDto;

            try
            {
                // Update the Base Product
                var baseProduct = await _productRepository.GetByIdAsync(request.ProductId);
                if (baseProduct == null)
                {
                    return new UpdateProductResponseDto
                    {
                        Success = false,
                        Message = "Product not found."
                    };
                }

                // Admin/SuperAdmin have full price control, Employees do not.
                if (!request.HasPriceControl && baseProduct.Price != dto.Price)
                {
                    return new UpdateProductResponseDto
                    {
                        Success = false,
                        Message = "Permission Denied: Only Admins can modify product prices."
                    };
                }

                baseProduct.Name = dto.Name;
                baseProduct.Category = dto.Category;
                baseProduct.Brand = dto.Brand;
                baseProduct.IsImported = dto.IsImported;
                baseProduct.IsCustomisable = dto.IsCustomisable;
                baseProduct.Price = dto.Price;
                baseProduct.Description = dto.Description;
                baseProduct.OnSpecial = dto.OnSpecial;
                baseProduct.IsVisible = dto.IsVisible;
                baseProduct.UpdatedAt = DateTime.UtcNow;

                await _productRepository.UpdateAsync(baseProduct);

                // Check and update Braai Subtype if it exists
                var braaiProduct = await _braaiProductRepository.GetByIdAsync(request.ProductId);
                if (braaiProduct != null)
                {
                    braaiProduct.FuelType = dto.FuelType ?? braaiProduct.FuelType;
                    braaiProduct.BraaiType = dto.BraaiType ?? braaiProduct.BraaiType;
                    await _braaiProductRepository.UpdateAsync(braaiProduct);
                }

                // Check and update Fireplace Subtype if it exists
                var fireplaceProduct = await _fireplaceProductRepository.GetByIdAsync(request.ProductId);
                if (fireplaceProduct != null)
                {
                    fireplaceProduct.HeatOutputKw = dto.HeatOutputKw ?? fireplaceProduct.HeatOutputKw;
                    fireplaceProduct.FireplaceType = dto.FireplaceType ?? fireplaceProduct.FireplaceType;
                    await _fireplaceProductRepository.UpdateAsync(fireplaceProduct);
                }

                return new UpdateProductResponseDto
                {
                    Success = true,
                    Message = "Product updated successfully."
                };
            }
            catch (Exception ex)
            {
                return new UpdateProductResponseDto
                {
                    Success = false,
                    Message = $"An error occurred during product update: {ex.Message}"
                };
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
