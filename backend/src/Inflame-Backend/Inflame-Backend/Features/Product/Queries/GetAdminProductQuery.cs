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
        /// <summary>
        /// Optional, generic search across name, brand, or SKU
        /// </summary>
        public string? SearchTerm { get; set; }

        //------------------------------------------------------------------------------------------//
        public string? ProductType { get; set; }

        //------------------------------------------------------------------------------------------//
        public string? Brand { get; set; }

        //------------------------------------------------------------------------------------------//
        public decimal? MinPrice { get; set; }

        //------------------------------------------------------------------------------------------//
        public decimal? MaxPrice { get; set; }

        //------------------------------------------------------------------------------------------//
        public string? FuelType { get; set; }

        //------------------------------------------------------------------------------------------//
        public decimal? MinHeatOutputKw { get; set; }

        //------------------------------------------------------------------------------------------//
        public decimal? MaxHeatOutputKw { get; set; }

        //------------------------------------------------------------------------------------------//
        public string? SortBy { get; set; }

        //------------------------------------------------------------------------------------------//
        public int PageNumber { get; set; } = 1;

        //------------------------------------------------------------------------------------------//
        public int PageSize { get; set; } = 20;

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
