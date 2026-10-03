using Microsoft.AspNetCore.DataProtection;
using Inflame_Backend.Identity;

namespace Inflame_Backend.Services.Authentication
{
    public class TrustedDeviceService
    {
        private readonly IConfiguration _configuration;
        private readonly IDataProtector _protector;
        private readonly Inflame_Backend.Data.Context.IdentityDbContext _dbContext;
        private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _httpContextAccessor;

        //------------------------------------------------------------------------------------------//
        public TrustedDeviceService(
            IConfiguration configuration,
            IDataProtectionProvider dataProtectionProvider,
            Inflame_Backend.Data.Context.IdentityDbContext dbContext,
            Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;

            _protector =
                dataProtectionProvider.CreateProtector(
                    "Inflame_Backend.TrustedDevice");
        }


        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Creates a trusted device token and stores the device in the database.
        /// </summary>
        public async Task<string> CreateTokenAsync(
            Guid userId,
            DateTimeOffset expiresAt)
        {
            var deviceName = _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].ToString() ?? "Unknown Device";
            if (deviceName.Length > 200) deviceName = deviceName.Substring(0, 200);

            var ipAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "Unknown IP";

            var device = new StaffTrustedDevice
            {
                UserId = userId,
                DeviceName = deviceName,
                IpAddress = ipAddress,
                ExpiresAt = expiresAt
            };

            _dbContext.StaffTrustedDevices.Add(device);
            await _dbContext.SaveChangesAsync();

            var payload =
                $"{device.Id}|{userId}|{expiresAt.ToUnixTimeSeconds()}";

            return _protector.Protect(payload);
        }


        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Validates a trusted device token against the database and updates its last used time.
        /// </summary>
        public async Task<bool> TryValidateTokenAsync(
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

                if (parts.Length != 3)
                {
                    return false;
                }

                if (!Guid.TryParse(parts[0], out var deviceId) ||
                    !Guid.TryParse(parts[1], out var userId) ||
                    !long.TryParse(parts[2], out var expiresAt))
                {
                    return false;
                }

                if (userId != expectedUserId)
                {
                    return false;
                }

                var expiration =
                    DateTimeOffset.FromUnixTimeSeconds(
                        expiresAt);

                if (DateTimeOffset.UtcNow >= expiration)
                {
                    return false;
                }

                var device = await _dbContext.StaffTrustedDevices.FindAsync(deviceId);
                if (device == null || device.UserId != expectedUserId)
                {
                    return false;
                }

                device.LastUsedAt = DateTimeOffset.UtcNow;
                await _dbContext.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }


        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Gets the expiration date for a new trusted device token based on configuration.
        /// </summary>
        public DateTimeOffset GetExpiration()
        {
            var days =
                _configuration.GetValue<int?>(
                    "Authentication:TrustedDeviceDays")
                ?? 14;

            return DateTimeOffset.UtcNow.AddDays(days);
        }


        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves all active trusted devices for a given user.
        /// </summary>
        public async Task<System.Collections.Generic.List<StaffTrustedDevice>> GetActiveDevicesAsync(Guid userId)
        {
            var now = DateTimeOffset.UtcNow;
            return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
                System.Linq.Queryable.Where(_dbContext.StaffTrustedDevices, d => d.UserId == userId && d.ExpiresAt > now)
            );
        }


        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Revokes a trusted device by deleting it from the database.
        /// </summary>
        public async Task<bool> RevokeDeviceAsync(Guid userId, Guid deviceId)
        {
            var device = await _dbContext.StaffTrustedDevices.FindAsync(deviceId);
            if (device != null && device.UserId == userId)
            {
                _dbContext.StaffTrustedDevices.Remove(device);
                await _dbContext.SaveChangesAsync();
                return true;
            }
            return false;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//