using System.Security.Cryptography;
using System.Text;

namespace Inflame_Backend.Services.Authentication
{
    public class TwoFactorChallengeService
    {
        private readonly IConfiguration _configuration;

        public TwoFactorChallengeService(
            IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string CreateChallenge(
            Guid userId,
            string purpose)
        {
            var expiresMinutes =
                _configuration.GetValue<int?>(
                    "Authentication:TwoFactorChallengeMinutes")
                ?? 5;

            var expiresAt =
                DateTimeOffset.UtcNow
                    .AddMinutes(expiresMinutes)
                    .ToUnixTimeSeconds();

            var randomBytes = RandomNumberGenerator.GetBytes(32);

            var randomPart =
                Convert.ToBase64String(randomBytes)
                    .Replace("+", "-")
                    .Replace("/", "_")
                    .Replace("=", "");

            var payload =
                $"{userId}:{purpose}:{expiresAt}:{randomPart}";

            return Convert.ToBase64String(
                Encoding.UTF8.GetBytes(payload));
        }

        public bool TryReadChallenge(
            string challenge,
            out Guid userId,
            out string purpose)
        {
            userId = Guid.Empty;
            purpose = string.Empty;

            try
            {
                var decoded =
                    Encoding.UTF8.GetString(
                        Convert.FromBase64String(challenge));

                var parts = decoded.Split(':');

                if (parts.Length != 4)
                {
                    return false;
                }

                if (!Guid.TryParse(parts[0], out userId))
                {
                    return false;
                }

                purpose = parts[1];

                if (!long.TryParse(
                        parts[2],
                        out var expiresAt))
                {
                    return false;
                }

                if (DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                    > expiresAt)
                {
                    return false;
                }

                return true;
            }
            catch
            {
                userId = Guid.Empty;
                purpose = string.Empty;
                return false;
            }
        }
    }
}