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
                var formatted = connectionString.Contains("://") ? connectionString : $"redis://{connectionString}";
                if (!Uri.TryCreate(formatted, UriKind.Absolute, out var uri))
                {
                    uri = new Uri("redis://127.0.0.1:6379");
                }

                var port = uri.Port > 0 ? uri.Port : 6379;

                var options = new ConfigurationOptions
                {
                    EndPoints =
                    {
                        {
                            uri.Host,
                            port
                        }
                    },

                    Ssl = uri.Scheme.Equals(
                        "rediss",
                        StringComparison.OrdinalIgnoreCase),

                    AbortOnConnectFail = false,
                    ConnectRetry = 3,
                    ConnectTimeout = 10000
                };

                if (!string.IsNullOrEmpty(uri.UserInfo))
                {
                    var userInfo = uri.UserInfo.Split(
                        ':',
                        2,
                        StringSplitOptions.None);

                    if (userInfo.Length > 0)
                    {
                        options.User = Uri.UnescapeDataString(
                            userInfo[0]);
                    }

                    if (userInfo.Length > 1)
                    {
                        options.Password = Uri.UnescapeDataString(
                            userInfo[1]);
                    }
                }

                return ConnectionMultiplexer.Connect(options);
            });
        }

        //------------------------------------------------------------------------------------------//
        public ConnectionMultiplexer Connection =>
            _lazyConnection.Value;

        //------------------------------------------------------------------------------------------//
        public IDatabase GetDatabase() =>
            Connection.GetDatabase();
    }
}
//---------------------END OF FILE------------------------------------------------------------------//