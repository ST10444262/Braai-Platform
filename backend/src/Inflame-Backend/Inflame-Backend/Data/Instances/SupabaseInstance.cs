using Supabase;

namespace Inflame_Backend.Data.Instances
{
    /// <summary>
    /// Represents a Supabase instance that manages the connection to the Supabase backend.
    /// </summary>
    public class SupabaseInstance
    {
        private readonly Client _client;
        //------------------------------------------------------------------------------------------//
        public SupabaseInstance(string url, string key)
        {
            var options = new SupabaseOptions
            {
                AutoRefreshToken = true,
                AutoConnectRealtime = true
            };

            _client = new Client(url, key, options);
            // Synchronously initializing for dependency injection startup safety
            _client.InitializeAsync().Wait();
        }
        //------------------------------------------------------------------------------------------//
        public Client Client => _client;
    }
}
//---------------------END OF FILE------------------------------------------------------------------//