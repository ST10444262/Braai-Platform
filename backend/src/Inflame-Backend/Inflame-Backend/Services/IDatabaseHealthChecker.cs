using System;
using System.Threading;
using System.Threading.Tasks;
using Inflame_Backend.Data.Context;
using Inflame_Backend.Data.Instances;

namespace Inflame_Backend.Services
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Represents the aggregated operational status across system dependencies (PostgreSQL Database & Upstash Redis).
    /// </summary>
    public class SystemHealthStatus
    {
        public bool IsDatabaseConnected { get; set; }
        public bool IsRedisConnected { get; set; }
        public string? DatabaseError { get; set; }
        public string? RedisError { get; set; }
        public bool IsHealthy => IsDatabaseConnected && IsRedisConnected;
    }

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Service contract for verifying database and critical external dependency connectivity.
    /// </summary>
    public interface IDatabaseHealthChecker
    {
        Task<bool> CanConnectAsync(CancellationToken cancellationToken = default);
        Task<bool> CanConnectRedisAsync(CancellationToken cancellationToken = default);
        Task<SystemHealthStatus> CheckComprehensiveHealthAsync(CancellationToken cancellationToken = default);
    }

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Implementation verifying connectivity to PostgreSQL database (via EF Core) and Upstash Redis.
    /// </summary>
    public class DatabaseHealthChecker : IDatabaseHealthChecker
    {
        #region Fields & Dependencies
        private readonly IdentityDbContext _dbContext;
        private readonly RedisInstance? _redisInstance;
        #endregion

        #region Constructor
        public DatabaseHealthChecker(IdentityDbContext dbContext, RedisInstance? redisInstance = null)
        {
            _dbContext = dbContext;
            _redisInstance = redisInstance;
        }
        #endregion

        #region Health Check Methods
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Verifies PostgreSQL database connectivity using EF Core DatabaseFacade.
        /// </summary>
        public Task<bool> CanConnectAsync(CancellationToken cancellationToken = default)
        {
            return _dbContext.Database.CanConnectAsync(cancellationToken);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Verifies Redis connectivity by executing a ping against the Redis connection multiplexer.
        /// </summary>
        public async Task<bool> CanConnectRedisAsync(CancellationToken cancellationToken = default)
        {
            if (_redisInstance == null)
            {
                return false;
            }

            try
            {
                var db = _redisInstance.GetDatabase();
                var pingTime = await db.PingAsync();
                return pingTime.TotalMilliseconds >= 0;
            }
            catch
            {
                return false;
            }
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Checks connectivity to both PostgreSQL and Redis, returning aggregated health status.
        /// </summary>
        public async Task<SystemHealthStatus> CheckComprehensiveHealthAsync(CancellationToken cancellationToken = default)
        {
            var status = new SystemHealthStatus();

            try
            {
                status.IsDatabaseConnected = await CanConnectAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                status.IsDatabaseConnected = false;
                status.DatabaseError = ex.Message;
            }

            try
            {
                status.IsRedisConnected = await CanConnectRedisAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                status.IsRedisConnected = false;
                status.RedisError = ex.Message;
            }

            return status;
        }
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//