using MediatR;
using Inflame_Backend.Models.CRM;
using System;
using System.Collections.Generic;

namespace Inflame_Backend.Features.Staff.Queries
{
    /// <summary>
    /// Admin query to fetch staff accounts. Supports retrieving a specific staff member by ID
    /// or a paginated list of all staff members (with optional role filtering).
    /// </summary>
    public class GetAdminStaffQuery : IRequest<IEnumerable<StaffAccount>>
    {
        #region Single Staff Lookup
        
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// If provided, returns only the specific Staff Account matching this ID.
        /// </summary>
        public Guid? StaffAccountId { get; set; }

        #endregion

        #region Filter Properties

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Optional. Filter staff by their role (e.g., "Super Admin", "Admin", "Employee").
        /// </summary>
        public string? Role { get; set; }

        //------------------------------------------------------------------------------------------//
        public int PageNumber { get; set; } = 1;

        //------------------------------------------------------------------------------------------//
        public int PageSize { get; set; } = 20;

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
