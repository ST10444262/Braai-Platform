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
        private readonly IProductImageRepository _productImageRepository;
        private readonly IMediator _mediator;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the handler with the required repositories.
        /// </summary>
        public UpdateProductCommandHandler(
            IProductRepository productRepository,
            IBraaiProductRepository braaiProductRepository,
            IFireplaceProductRepository fireplaceProductRepository,
            IProductImageRepository productImageRepository,
            IMediator mediator)
        {
            _productRepository = productRepository;
            _braaiProductRepository = braaiProductRepository;
            _fireplaceProductRepository = fireplaceProductRepository;
            _productImageRepository = productImageRepository;
            _mediator = mediator;
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
                baseProduct.Category = dto.Category ?? string.Empty;
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

                // Process Existing Images (delete those that are not in the ExistingImageIds list)
                var currentImages = await _productImageRepository.GetByProductIdAsync(request.ProductId);
                var existingImageIds = dto.ExistingImageIds ?? new System.Collections.Generic.List<Guid>();

                foreach (var img in currentImages)
                {
                    if (!existingImageIds.Contains(img.ImageId))
                    {
                        var deleteCommand = new DeleteProductImageCommand(img.ImageId);
                        await _mediator.Send(deleteCommand, cancellationToken);
                    }
                    else
                    {
                        // Check if we need to update the primary status
                        if (dto.PrimaryImageId.HasValue)
                        {
                            bool shouldBePrimary = img.ImageId == dto.PrimaryImageId.Value;
                            if (img.IsPrimary != shouldBePrimary)
                            {
                                img.IsPrimary = shouldBePrimary;
                                await _productImageRepository.UpdateAsync(img);
                            }
                        }
                    }
                }

                // If no PrimaryImageId was explicitly set, and no existing images are primary, make the first one primary
                if (!dto.PrimaryImageId.HasValue && existingImageIds.Count > 0)
                {
                    var keptImages = currentImages.Where(i => existingImageIds.Contains(i.ImageId)).ToList();
                    if (keptImages.Any() && !keptImages.Any(i => i.IsPrimary))
                    {
                        var first = keptImages.First();
                        first.IsPrimary = true;
                        await _productImageRepository.UpdateAsync(first);
                    }
                }

                // Upload New Images
                if (dto.Images != null && dto.Images.Count > 0)
                {
                    var uploadCommand = new UploadProductImagesCommand(request.ProductId, dto.Images);
                    await _mediator.Send(uploadCommand, cancellationToken);
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
