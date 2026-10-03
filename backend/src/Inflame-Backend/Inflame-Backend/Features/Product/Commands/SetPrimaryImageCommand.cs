using Inflame_Backend.Data.Repositories.ProductCatalog;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Product.Commands
{
    //------------------------------------------------------------------------------------------//
    public record SetPrimaryImageCommand(Guid ProductId, Guid ImageId) : IRequest<bool>;

    //------------------------------------------------------------------------------------------//
    public class SetPrimaryImageCommandHandler : IRequestHandler<SetPrimaryImageCommand, bool>
    {
        private readonly IProductImageRepository _productImageRepository;

        //------------------------------------------------------------------------------------------//
        public SetPrimaryImageCommandHandler(IProductImageRepository productImageRepository)
        {
            _productImageRepository = productImageRepository;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<bool> Handle(SetPrimaryImageCommand request, CancellationToken cancellationToken)
        {
            var images = await _productImageRepository.GetAllAsync();
            var productImages = images.Where(i => i.ProductId == request.ProductId).ToList();

            if (!productImages.Any(i => i.ImageId == request.ImageId))
            {
                return false;
            }

            foreach (var img in productImages)
            {
                img.IsPrimary = (img.ImageId == request.ImageId);
                await _productImageRepository.UpdateAsync(img);
            }

            return true;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
