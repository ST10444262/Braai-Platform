using MediatR;
using Inflame_Backend.Facades;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Product.Queries
{
    /// <summary>
    /// Handles the admin query for products, explicitly bypassing the visibility filters.
    /// </summary>
    public class GetAdminProductQueryHandler : IRequestHandler<GetAdminProductQuery, IEnumerable<Models.ProductCatalog.Product>>
    {
        private readonly IProductCatalogueFacade _facade;

        #region Constructors

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the GetAdminProductQueryHandler with the required facade dependency.
        /// </summary>
        /// <param name="facade">The facade coordinating product catalog logic.</param>
        public GetAdminProductQueryHandler(IProductCatalogueFacade facade)
        {
            _facade = facade;
        }

        #endregion

        #region Handler Methods

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Processes the admin query. Passes 'includeHidden: true' to the facade to ensure 
        /// admins can view drafted or out-of-stock items.
        /// </summary>
        public async Task<IEnumerable<Models.ProductCatalog.Product>> Handle(GetAdminProductQuery request, CancellationToken cancellationToken)
        {
            // Fetches a single product by ID
            if (request.ProductId.HasValue)
            {
                var singleProduct = await _facade.GetProductDetailsAsync(request.ProductId.Value);
                
                // Return an empty list if not found, or a list with the single product
                return singleProduct == null 
                    ? Enumerable.Empty<Models.ProductCatalog.Product>() 
                    : new List<Models.ProductCatalog.Product> { singleProduct };
            }

            // Else it fetches the filtered and paginated admin catalog with the hidden flag set to true
            return await _facade.GetFilteredCatalogAsync(
                request.Category,
                request.ProductType,
                request.Brand,
                request.MinPrice,
                request.MaxPrice,
                request.FuelType,
                request.MinHeatOutputKw,
                request.MaxHeatOutputKw,
                request.SortBy,
                request.PageNumber,
                request.PageSize,
                includeHidden: true
            );
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
