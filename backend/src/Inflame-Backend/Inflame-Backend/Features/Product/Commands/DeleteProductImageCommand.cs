using Inflame_Backend.Data.Adapters;
using Inflame_Backend.Data.Repositories.ProductCatalog;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Product.Commands
{
    //------------------------------------------------------------------------------------------//
    public record DeleteProductImageCommand(Guid ImageId) : IRequest<bool>;

    //------------------------------------------------------------------------------------------//
    public class DeleteProductImageCommandHandler : IRequestHandler<DeleteProductImageCommand, bool>
    {
        private readonly IProductImageRepository _productImageRepository;
        private readonly IStorageAdapter _storageAdapter;
        private readonly Microsoft.Extensions.Logging.ILogger<DeleteProductImageCommandHandler> _logger;

        //------------------------------------------------------------------------------------------//
        public DeleteProductImageCommandHandler(
            IProductImageRepository productImageRepository,
            IStorageAdapter storageAdapter,
            Microsoft.Extensions.Logging.ILogger<DeleteProductImageCommandHandler> logger)
        {
            _productImageRepository = productImageRepository;
            _storageAdapter = storageAdapter;
            _logger = logger;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<bool> Handle(DeleteProductImageCommand request, CancellationToken cancellationToken)
        {
            var image = await _productImageRepository.GetByIdAsync(request.ImageId);
            if (image == null) return false;

            try
            {
                // Delete from Supabase Storage
                var fileName = image.Url.Substring(image.Url.LastIndexOf('/') + 1);
                await _storageAdapter.DeleteFileAsync("products", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete file from Supabase storage. Url: {Url}, FileName: {FileName}", image.Url, image.Url.Substring(image.Url.LastIndexOf('/') + 1));
                // Continue with database deletion even if storage deletion fails
            }

            await _productImageRepository.DeleteAsync(image);
            return true;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
