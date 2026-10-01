using MediatR;
using Inflame_Backend.Data.Repositories.CRM;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Client.Queries
{
    /// <summary>
    /// Handles the admin query for Clients, supporting email filtering and pagination.
    /// </summary>
    public class GetAdminClientQueryHandler : IRequestHandler<GetAdminClientQuery, IEnumerable<Models.CRM.Client>>
    {
        private readonly IClientRepository _clientRepository;
        private readonly IInvoiceRecordRepository _invoiceRecordRepository;
        private readonly IInternalNoteRepository _internalNoteRepository;

        #region Constructors

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the GetAdminClientQueryHandler with the required repository dependency.
        /// </summary>
        public GetAdminClientQueryHandler(
            IClientRepository clientRepository, 
            IInvoiceRecordRepository invoiceRecordRepository,
            IInternalNoteRepository internalNoteRepository)
        {
            _clientRepository = clientRepository;
            _invoiceRecordRepository = invoiceRecordRepository;
            _internalNoteRepository = internalNoteRepository;
        }

        #endregion

        #region Handler Methods

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Processes the query to fetch either a single client or a paginated, filtered list.
        /// </summary>
        public async Task<IEnumerable<Models.CRM.Client>> Handle(GetAdminClientQuery request, CancellationToken cancellationToken)
        {
            // Fetches a single Client by ID for detailed CRM inspection
            if (request.ClientId.HasValue)
            {
                var singleClient = await _clientRepository.GetByIdAsync(request.ClientId.Value);
                
                if (singleClient != null)
                {
                    singleClient.InvoiceRecords = await _invoiceRecordRepository.GetByClientIdAsync(singleClient.ClientId);
                    singleClient.InternalNotes = await _internalNoteRepository.GetByClientIdAsync(singleClient.ClientId);
                    return new List<Models.CRM.Client> { singleClient };
                }
                
                return Enumerable.Empty<Models.CRM.Client>();
            }

            // Else it fetches the filtered and paginated list of clients
            var allClients = await _clientRepository.GetAllAsync();
            var query = allClients.AsQueryable();

            // Apply Email Filter if provided
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                query = query.Where(c => c.Email.Contains(request.Email, System.StringComparison.OrdinalIgnoreCase));
            }

            // Apply Generic Search Filter if provided
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                query = query.Where(c => 
                    c.FirstName.Contains(request.SearchTerm, System.StringComparison.OrdinalIgnoreCase) ||
                    c.LastName.Contains(request.SearchTerm, System.StringComparison.OrdinalIgnoreCase) ||
                    c.Email.Contains(request.SearchTerm, System.StringComparison.OrdinalIgnoreCase) ||
                    (c.Phone != null && c.Phone.Contains(request.SearchTerm, System.StringComparison.OrdinalIgnoreCase)));
            }

            // Apply Pagination
            var paginatedClients = query
                .OrderBy(c => c.LastName) 
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            return paginatedClients;
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
