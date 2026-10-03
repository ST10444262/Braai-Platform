using Microsoft.AspNetCore.DataProtection;

namespace Inflame_Backend.Services.Authentication
{
    public class TrustedDeviceService
    {
        private readonly IConfiguration _configuration;
        private readonly IDataProtector _protector;

        public TrustedDeviceService(
            IConfiguration configuration,
            IDataProtectionProvider dataProtectionProvider)
        {
            _configuration = configuration;

            _protector =
                dataProtectionProvider.CreateProtector(
                    "Inflame_Backend.TrustedDevice");
        }

        public string CreateToken(
            Guid userId,
            DateTimeOffset expiresAt)
        {
            var payload =
                $"{userId}|{expiresAt.ToUnixTimeSeconds()}";

            return _protector.Protect(payload);
        }

        public bool TryValidateToken(
            string token,
            Guid expectedUserId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token))
                {
                    return false;
                }

                var payload =
                    _protector.Unprotect(token);

                var parts = payload.Split('|');

                if (parts.Length != 2)
                {
                    return false;
                }

                if (!Guid.TryParse(
                        parts[0],
                        out var userId))
                {
                    return false;
                }

                if (userId != expectedUserId)
                {
                    return false;
                }

                if (!long.TryParse(
                        parts[1],
                        out var expiresAt))
                {
                    return false;
                }

                var expiration =
                    DateTimeOffset.FromUnixTimeSeconds(
                        expiresAt);

                return DateTimeOffset.UtcNow < expiration;
            }
            catch
            {
                return false;
            }
        }

        public DateTimeOffset GetExpiration()
        {
            var days =
                _configuration.GetValue<int?>(
                    "Authentication:TrustedDeviceDays")
                ?? 14;

            return DateTimeOffset.UtcNow.AddDays(days);
        }
    }
}