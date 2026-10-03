using MediatR;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Models.CRM;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Enquiries.Queries
{
    /// <summary>
    /// Handles the admin query for Enquiries (Leads), supporting filtering by status and pagination.
    /// </summary>
    public class GetAdminEnquiryQueryHandler : IRequestHandler<GetAdminEnquiryQuery, IEnumerable<Enquiry>>
    {
        private readonly IEnquiryRepository _enquiryRepository;

        #region Constructors

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the GetAdminEnquiryQueryHandler with the required repository dependency.
        /// </summary>
        /// <param name="enquiryRepository">The repository for accessing enquiry data.</param>
        public GetAdminEnquiryQueryHandler(IEnquiryRepository enquiryRepository)
        {
            _enquiryRepository = enquiryRepository;
        }

        #endregion

        #region Handler Methods

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Processes the query to fetch either a single enquiry or a paginated, filtered list.
        /// </summary>
        public async Task<IEnumerable<Enquiry>> Handle(GetAdminEnquiryQuery request, CancellationToken cancellationToken)
        {
            // Fetches a single enquiry by ID for detailed inspection
            if (request.EnquiryId.HasValue)
            {
                var singleEnquiry = await _enquiryRepository.GetByIdAsync(request.EnquiryId.Value);
                
                return singleEnquiry == null 
                    ? Enumerable.Empty<Enquiry>() 
                    : new List<Enquiry> { singleEnquiry };
            }

            // Else it fetches the filtered and paginated list of enquiries
            var allEnquiries = await _enquiryRepository.GetAllAsync();
            var query = allEnquiries.AsQueryable();

            // Apply Status Filter if provided
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                query = query.Where(e => e.Status.Equals(request.Status, System.StringComparison.OrdinalIgnoreCase));
            }

            // Apply Generic Search Filter if provided
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                query = query.Where(e => 
                    e.FirstName.Contains(request.SearchTerm, System.StringComparison.OrdinalIgnoreCase) ||
                    e.LastName.Contains(request.SearchTerm, System.StringComparison.OrdinalIgnoreCase) ||
                    e.Email.Contains(request.SearchTerm, System.StringComparison.OrdinalIgnoreCase) ||
                    (e.Phone != null && e.Phone.Contains(request.SearchTerm, System.StringComparison.OrdinalIgnoreCase)));
            }

            // Apply Pagination
            var paginatedEnquiries = query
                .OrderByDescending(e => e.CreatedAt) 
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            return paginatedEnquiries;
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
