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

        #region Constructors

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the GetAdminClientQueryHandler with the required repository dependency.
        /// </summary>
        /// <param name="clientRepository">The repository for accessing client data.</param>
        public GetAdminClientQueryHandler(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
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
                
                return singleClient == null 
                    ? Enumerable.Empty<Models.CRM.Client>() 
                    : new List<Models.CRM.Client> { singleClient };
            }

            // Else it fetches the filtered and paginated list of clients
            var allClients = await _clientRepository.GetAllAsync();
            var query = allClients.AsQueryable();

            // Apply Email Filter if provided
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                query = query.Where(c => c.Email.Contains(request.Email, System.StringComparison.OrdinalIgnoreCase));
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
