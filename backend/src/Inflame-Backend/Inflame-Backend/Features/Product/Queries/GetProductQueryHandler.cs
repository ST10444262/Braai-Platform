using MediatR;
using Inflame_Backend.Facades;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Product.Queries
{
    /// <summary>
    /// Handles the unified GetProductQuery, delegating the complex logic to the ProductCatalogueFacade.
    /// </summary>
    public class GetProductQueryHandler : IRequestHandler<GetProductQuery, IEnumerable<Models.ProductCatalog.Product>>
    {
        private readonly IProductCatalogueFacade _facade;

        #region Constructors

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the GetProductQueryHandler with the required facade dependency.
        /// </summary>
        /// <param name="facade">The facade coordinating product catalog logic.</param>
        public GetProductQueryHandler(IProductCatalogueFacade facade)
        {
            _facade = facade;
        }

        #endregion

        #region Handler Methods

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Processes the unified query. If a ProductId is present, fetches a single product.
        /// Otherwise, fetches the paginated and filtered catalog.
        /// </summary>
        public async Task<IEnumerable<Models.ProductCatalog.Product>> Handle(GetProductQuery request, CancellationToken cancellationToken)
        {
            // First tries to fetch a single product by ID
            if (request.ProductId.HasValue)
            {
                var singleProduct = await _facade.GetProductDetailsAsync(request.ProductId.Value);
                
                // Return an empty list if not found, or a list with the single product
                return singleProduct == null 
                    ? Enumerable.Empty<Models.ProductCatalog.Product>() 
                    : new List<Models.ProductCatalog.Product> { singleProduct };
            }

            // Else it fetches the filtered and paginated catalog
            return await _facade.GetFilteredCatalogAsync(
                request.Category,
                request.Brand,
                request.MinPrice,
                request.MaxPrice,
                request.PageNumber,
                request.PageSize
            );
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
