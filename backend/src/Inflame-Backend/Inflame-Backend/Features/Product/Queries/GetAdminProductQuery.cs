using MediatR;
using Inflame_Backend.Models.ProductCatalog;
using System;
using System.Collections.Generic;

namespace Inflame_Backend.Features.Product.Queries
{
    /// <summary>
    /// Admin query to fetch products. Supports fetching a single product by ID or a full catalog,
    /// bypassing public visibility restrictions so admins can see hidden products.
    /// </summary>
    public class GetAdminProductQuery : IRequest<IEnumerable<Models.ProductCatalog.Product>>
    {
        #region Single Product Query
        
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// If provided, returns only the specific product matching this ID.
        /// </summary>
        public Guid? ProductId { get; set; }

        #endregion

        #region Catalog Filter Queries

        //------------------------------------------------------------------------------------------//
        public string? Category { get; set; }

        //------------------------------------------------------------------------------------------//
        public string? Brand { get; set; }

        //------------------------------------------------------------------------------------------//
        public decimal? MinPrice { get; set; }

        //------------------------------------------------------------------------------------------//
        public decimal? MaxPrice { get; set; }

        //------------------------------------------------------------------------------------------//
        public int PageNumber { get; set; } = 1;

        //------------------------------------------------------------------------------------------//
        public int PageSize { get; set; } = 20;

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
