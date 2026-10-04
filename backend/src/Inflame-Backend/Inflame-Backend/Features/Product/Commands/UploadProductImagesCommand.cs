using Inflame_Backend.Data.Adapters;
using Inflame_Backend.Data.Repositories.ProductCatalog;
using Inflame_Backend.Features.Product.DTOs;
using Inflame_Backend.Models.ProductCatalog;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Product.Commands
{
    //------------------------------------------------------------------------------------------//
    public record UploadProductImagesCommand(Guid ProductId, List<IFormFile> Images) : IRequest<bool>;

    //------------------------------------------------------------------------------------------//
    public class UploadProductImagesCommandHandler : IRequestHandler<UploadProductImagesCommand, bool>
    {
        private readonly IProductImageRepository _productImageRepository;
        private readonly IStorageAdapter _storageAdapter;
        private readonly Microsoft.Extensions.Logging.ILogger<UploadProductImagesCommandHandler> _logger;

        //------------------------------------------------------------------------------------------//
        public UploadProductImagesCommandHandler(
            IProductImageRepository productImageRepository,
            IStorageAdapter storageAdapter,
            Microsoft.Extensions.Logging.ILogger<UploadProductImagesCommandHandler> logger)
        {
            _productImageRepository = productImageRepository;
            _storageAdapter = storageAdapter;
            _logger = logger;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<bool> Handle(UploadProductImagesCommand request, CancellationToken cancellationToken)
        {
            if (request.Images == null || !request.Images.Any())
            {
                return false;
            }

            // Check if there are already images to determine if the first uploaded one should be primary
            var existingImages = await _productImageRepository.GetAllAsync();
            var hasPrimary = existingImages.Any(i => i.ProductId == request.ProductId && i.IsPrimary);

            try
            {
                foreach (var image in request.Images)
                {
                    if (image.Length > 0)
                    {
                        var extension = Path.GetExtension(image.FileName);
                        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                        
                        using var memoryStream = new MemoryStream();
                        await image.CopyToAsync(memoryStream, cancellationToken);
                        var fileBytes = memoryStream.ToArray();

                        await _storageAdapter.UploadFileAsync("products", uniqueFileName, fileBytes);
                        var publicUrl = _storageAdapter.GetFileUrl("products", uniqueFileName);

                        var productImage = new ProductImage
                        {
                            ImageId = Guid.NewGuid(),
                            ProductId = request.ProductId,
                            Url = publicUrl,
                            IsPrimary = !hasPrimary 
                        };

                        await _productImageRepository.AddAsync(productImage);
                        hasPrimary = true; // any subsequent images won't be primary
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload product images.");
                return false;
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
