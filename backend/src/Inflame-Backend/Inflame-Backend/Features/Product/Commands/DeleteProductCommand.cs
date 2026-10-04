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
    /// Command to delete a product.
    /// </summary>
    public record DeleteProductCommand(Guid ProductId) : IRequest<DeleteProductResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the product deletion process.
    /// </summary>
    public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, DeleteProductResponseDto>
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
        public DeleteProductCommandHandler(
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
        /// Executes the deletion of the product and all associated subtype/image records.
        /// </summary>
        public async Task<DeleteProductResponseDto> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var baseProduct = await _productRepository.GetByIdAsync(request.ProductId);
                if (baseProduct == null)
                {
                    return new DeleteProductResponseDto
                    {
                        Success = false,
                        Message = "Product not found."
                    };
                }

                // Delete associated subtypes explicitly to prevent orphaned records or constraint violations
                var braaiProduct = await _braaiProductRepository.GetByIdAsync(request.ProductId);
                if (braaiProduct != null)
                {
                    await _braaiProductRepository.DeleteAsync(braaiProduct);
                }

                var fireplaceProduct = await _fireplaceProductRepository.GetByIdAsync(request.ProductId);
                if (fireplaceProduct != null)
                {
                    await _fireplaceProductRepository.DeleteAsync(fireplaceProduct);
                }

                // Images might cascade via Supabase, but manually clearing them guarantees cache invalidation and deletes files from storage
                var allImages = await _productImageRepository.GetAllAsync();
                foreach (var img in allImages)
                {
                    if (img.ProductId == request.ProductId)
                    {
                        await _mediator.Send(new DeleteProductImageCommand(img.ImageId), cancellationToken);
                    }
                }

                // Delete base product
                await _productRepository.DeleteAsync(baseProduct);

                return new DeleteProductResponseDto
                {
                    Success = true,
                    Message = "Product deleted successfully."
                };
            }
            catch (Exception ex)
            {
                return new DeleteProductResponseDto
                {
                    Success = false,
                    Message = $"An error occurred during product deletion: {ex.Message}"
                };
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
