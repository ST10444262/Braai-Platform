using Inflame_Backend.Data.Adapters;
using Inflame_Backend.Data.Repositories.ProductCatalog;
using Inflame_Backend.Factories;
using Inflame_Backend.Features.Product.DTOs;
using Inflame_Backend.Models.ProductCatalog;
using MediatR;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Product.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Command to create a new product, utilizing the ProductFactory for specific subtypes.
    /// </summary>
    public record CreateProductCommand(CreateProductRequestDto RequestDto) : IRequest<CreateProductResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the product creation process.
    /// </summary>
    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, CreateProductResponseDto>
    {
        private readonly IProductRepository _productRepository;
        private readonly IBraaiProductRepository _braaiProductRepository;
        private readonly IFireplaceProductRepository _fireplaceProductRepository;
        private readonly IProductImageRepository _productImageRepository;
        private readonly IStorageAdapter _storageAdapter;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the handler with the required repositories and the storage adapter.
        /// </summary>
        public CreateProductCommandHandler(
            IProductRepository productRepository,
            IBraaiProductRepository braaiProductRepository,
            IFireplaceProductRepository fireplaceProductRepository,
            IProductImageRepository productImageRepository,
            IStorageAdapter storageAdapter)
        {
            _productRepository = productRepository;
            _braaiProductRepository = braaiProductRepository;
            _fireplaceProductRepository = fireplaceProductRepository;
            _productImageRepository = productImageRepository;
            _storageAdapter = storageAdapter;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Executes the creation of a base product, optionally its subtype using the ProductFactory, 
        /// and securely processes image uploads via the adapter pattern.
        /// </summary>
        public async Task<CreateProductResponseDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            var dto = request.RequestDto;

            try
            {
                // Create and save the Base Product
                var baseProduct = new Models.ProductCatalog.Product
                {
                    ProductId = Guid.NewGuid(),
                    Name = dto.Name,
                    Category = dto.Category,
                    Brand = dto.Brand,
                    IsImported = dto.IsImported,
                    IsCustomisable = dto.IsCustomisable,
                    Price = dto.Price,
                    Description = dto.Description,
                    OnSpecial = dto.OnSpecial,
                    IsVisible = dto.IsVisible,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _productRepository.AddAsync(baseProduct);

                // Utilize the Factory Method to create subtypes
                if (!string.IsNullOrEmpty(dto.ProductType) && dto.ProductType.Equals("Braai", StringComparison.OrdinalIgnoreCase))
                {
                    var fuel = string.IsNullOrWhiteSpace(dto.FuelType) ? "Unknown" : dto.FuelType;
                    var braaiType = string.IsNullOrWhiteSpace(dto.BraaiType) ? "Unknown" : dto.BraaiType;

                    var braaiProduct = ProductFactory.CreateBraaiProduct(baseProduct, fuel, braaiType);
                    await _braaiProductRepository.AddAsync(braaiProduct);
                }
                else if (!string.IsNullOrEmpty(dto.ProductType) && dto.ProductType.Equals("Fireplace", StringComparison.OrdinalIgnoreCase))
                {
                    var heat = dto.HeatOutputKw ?? 0m;
                    var fpType = string.IsNullOrWhiteSpace(dto.FireplaceType) ? "Unknown" : dto.FireplaceType;

                    var fireplaceProduct = ProductFactory.CreateFireplaceProduct(baseProduct, heat, fpType);
                    await _fireplaceProductRepository.AddAsync(fireplaceProduct);
                }

                // Process Images via the Adapter Pattern
                if (dto.Images != null && dto.Images.Count > 0)
                {
                    bool isFirst = true;
                    foreach (var image in dto.Images)
                    {
                        if (image.Length > 0)
                        {
                            var extension = Path.GetExtension(image.FileName);
                            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                            
                            using var memoryStream = new MemoryStream();
                            await image.CopyToAsync(memoryStream, cancellationToken);
                            var fileBytes = memoryStream.ToArray();

                            // Upload to third-party cloud storage (Supabase S3) using the adapter
                            await _storageAdapter.UploadFileAsync("products", uniqueFileName, fileBytes);
                            
                            // Retrieve the public URL
                            var publicUrl = _storageAdapter.GetFileUrl("products", uniqueFileName);

                            var productImage = new ProductImage
                            {
                                ImageId = Guid.NewGuid(),
                                ProductId = baseProduct.ProductId,
                                Url = publicUrl,
                                IsPrimary = isFirst 
                            };

                            await _productImageRepository.AddAsync(productImage);
                            isFirst = false;
                        }
                    }
                }

                return new CreateProductResponseDto
                {
                    Success = true,
                    Message = "Product created successfully.",
                    ProductId = baseProduct.ProductId
                };
            }
            catch (Exception ex)
            {
                return new CreateProductResponseDto
                {
                    Success = false,
                    Message = $"An error occurred during product creation: {ex.Message}",
                    ProductId = null
                };
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
