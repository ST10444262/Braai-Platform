using MediatR;
using Inflame_Backend.Models.CRM;
using System;
using System.Collections.Generic;

namespace Inflame_Backend.Features.Enquiries.Queries
{
    /// <summary>
    /// Unified query for Admins to fetch either a specific Enquiry by ID or a paginated list of Enquiries.
    /// </summary>
    public class GetEnquiryQuery : IRequest<IEnumerable<Enquiry>>
    {
        #region Single Enquiry Lookup
        
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// If provided, returns only the specific Enquiry matching this ID.
        /// </summary>
        public Guid? EnquiryId { get; set; }

        #endregion

        #region Filter Properties

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Optional, Filter by the status of the enquiry
        /// </summary>
        public string? Status { get; set; }

        //------------------------------------------------------------------------------------------//
        public int PageNumber { get; set; } = 1;

        //------------------------------------------------------------------------------------------//
        public int PageSize { get; set; } = 20;

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
