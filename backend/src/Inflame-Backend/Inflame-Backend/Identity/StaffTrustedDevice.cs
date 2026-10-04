using System;

namespace Inflame_Backend.Identity
{
    //------------------------------------------------------------------------------------------//
    #region Models
    public class StaffTrustedDevice
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset LastUsedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset ExpiresAt { get; set; }
        public ApplicationUser User { get; set; } = null!;
    }
    #endregion
}
//---------------------END OF FILE------------------------------------------------------------------//
