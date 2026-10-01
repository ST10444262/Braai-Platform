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

        //------------------------------------------------------------------------------------------//
        public DeleteProductImageCommandHandler(
            IProductImageRepository productImageRepository,
            IStorageAdapter storageAdapter)
        {
            _productImageRepository = productImageRepository;
            _storageAdapter = storageAdapter;
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
            catch
            {
                // Continue with database deletion even if storage deletion fails
            }

            await _productImageRepository.DeleteAsync(image);
            return true;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
