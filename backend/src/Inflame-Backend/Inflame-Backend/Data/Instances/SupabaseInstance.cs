using Supabase;

namespace Inflame_Backend.Data.Instances
{
    /// <summary>
    /// Represents a Supabase instance that manages the connection to the Supabase backend.
    /// </summary>
    public class SupabaseInstance
    {
        private readonly Lazy<Client?> _lazyClient;
        //------------------------------------------------------------------------------------------//
        public SupabaseInstance(string url, string key)
        {
            _lazyClient = new Lazy<Client?>(() =>
            {
                if (string.IsNullOrWhiteSpace(url) || !Uri.TryCreate(url, UriKind.Absolute, out _))
                {
                    return null;
                }

                var options = new SupabaseOptions
                {
                    AutoRefreshToken = true,
                    AutoConnectRealtime = true
                };

                var client = new Client(url, key, options);
                client.InitializeAsync().Wait();
                return client;
            });
        }
        //------------------------------------------------------------------------------------------//
        public Client Client => _lazyClient.Value ?? throw new InvalidOperationException("Supabase is not configured. Please set Supabase:Url and Supabase:Key in your configuration.");
    }
}
//---------------------END OF FILE------------------------------------------------------------------//