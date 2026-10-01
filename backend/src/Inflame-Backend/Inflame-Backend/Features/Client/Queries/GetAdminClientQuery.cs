using MediatR;
using Inflame_Backend.Models.CRM;
using System;
using System.Collections.Generic;

namespace Inflame_Backend.Features.Client.Queries
{
    /// <summary>
    /// Admin query to fetch clients from the CRM. Supports fetching a specific client by ID,
    /// filtering by email, or retrieving a paginated list of all clients.
    /// </summary>
    public class GetAdminClientQuery : IRequest<IEnumerable<Models.CRM.Client>>
    {
        #region Single Client Lookup
        
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// If provided, returns only the specific Client matching this ID.
        /// </summary>
        public Guid? ClientId { get; set; }

        #endregion

        #region Filter Properties

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Optional, Filter clients by their email address
        /// </summary>
        public string? Email { get; set; }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Optional, generic search across name, email, or phone
        /// </summary>
        public string? SearchTerm { get; set; }

        //------------------------------------------------------------------------------------------//
        public int PageNumber { get; set; } = 1;

        //------------------------------------------------------------------------------------------//
        public int PageSize { get; set; } = 20;

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
