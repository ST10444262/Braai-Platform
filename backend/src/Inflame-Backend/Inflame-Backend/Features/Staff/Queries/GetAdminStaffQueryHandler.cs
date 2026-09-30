using MediatR;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Models.CRM;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Staff.Queries
{
    /// <summary>
    /// Handles the admin query for Staff Accounts, supporting role filtering and pagination.
    /// </summary>
    public class GetAdminStaffQueryHandler : IRequestHandler<GetAdminStaffQuery, IEnumerable<StaffAccount>>
    {
        private readonly IStaffAccountRepository _staffAccountRepository;

        #region Constructors

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the GetAdminStaffQueryHandler with the required repository dependency.
        /// </summary>
        /// <param name="staffAccountRepository">The repository for accessing staff data.</param>
        public GetAdminStaffQueryHandler(IStaffAccountRepository staffAccountRepository)
        {
            _staffAccountRepository = staffAccountRepository;
        }

        #endregion

        #region Handler Methods

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Processes the query to fetch either a single staff member or a paginated, filtered list.
        /// </summary>
        public async Task<IEnumerable<StaffAccount>> Handle(GetAdminStaffQuery request, CancellationToken cancellationToken)
        {
            // Fetches a single Staff Account by ID
            if (request.StaffAccountId.HasValue)
            {
                var singleStaff = await _staffAccountRepository.GetByIdAsync(request.StaffAccountId.Value);
                
                return singleStaff == null 
                    ? Enumerable.Empty<StaffAccount>() 
                    : new List<StaffAccount> { singleStaff };
            }

            // Else it fetches the filtered and paginated list of staff accounts
            var allStaff = await _staffAccountRepository.GetAllAsync();
            var query = allStaff.AsQueryable();

            // Apply Role Filter if provided
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                query = query.Where(s => s.Role.Equals(request.Role, System.StringComparison.OrdinalIgnoreCase));
            }

            // Apply Pagination
            var paginatedStaff = query
                .OrderBy(s => s.LastName) 
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            return paginatedStaff;
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
