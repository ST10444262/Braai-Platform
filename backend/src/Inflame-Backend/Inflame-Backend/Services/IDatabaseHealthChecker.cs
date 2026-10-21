using System.Threading;
using System.Threading.Tasks;
using Inflame_Backend.Data.Context;

namespace Inflame_Backend.Services
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Service contract for verifying database connectivity.
    /// </summary>
    public interface IDatabaseHealthChecker
    {
        Task<bool> CanConnectAsync(CancellationToken cancellationToken = default);
    }

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Default implementation that tests database connectivity using Entity Framework Core's DatabaseFacade.
    /// </summary>
    public class DatabaseHealthChecker : IDatabaseHealthChecker
    {
        private readonly IdentityDbContext _dbContext;

        public DatabaseHealthChecker(IdentityDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public Task<bool> CanConnectAsync(CancellationToken cancellationToken = default)
        {
            return _dbContext.Database.CanConnectAsync(cancellationToken);
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
