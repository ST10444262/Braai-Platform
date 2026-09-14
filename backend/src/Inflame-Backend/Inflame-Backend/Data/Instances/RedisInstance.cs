using StackExchange.Redis;

namespace Inflame_Backend.Data.Instances
{
    /// <summary>
    /// Represents a Redis instance that manages the connection to the Redis server.
    /// </summary>
    public class RedisInstance
    {
        private readonly Lazy<ConnectionMultiplexer> _lazyConnection;
        //------------------------------------------------------------------------------------------//
        public RedisInstance(string connectionString)
        {
            _lazyConnection = new Lazy<ConnectionMultiplexer>(() =>
            {
                return ConnectionMultiplexer.Connect(connectionString);
            });
        }
        //------------------------------------------------------------------------------------------//
        public ConnectionMultiplexer Connection => _lazyConnection.Value;
        //------------------------------------------------------------------------------------------//
        public IDatabase GetDatabase() => Connection.GetDatabase();
    }
}
//---------------------END OF FILE------------------------------------------------------------------//