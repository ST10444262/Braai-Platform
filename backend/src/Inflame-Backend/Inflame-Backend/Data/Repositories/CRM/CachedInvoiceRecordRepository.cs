using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Data.Instances;
using Inflame_Backend.Models.CRM;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// Cached implementation of the IInvoiceRecordRepository using Redis.
    /// </summary>
    public class CachedInvoiceRecordRepository : CachedBaseRepository<InvoiceRecord>, IInvoiceRecordRepository
    {
        #region Configuration
        private readonly IInvoiceRecordRepository _innerSpecificRepository;
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes a new instance of the CachedInvoiceRecordRepository.
        /// </summary>
        /// <param name="innerRepository"></param>
        /// <param name="redisInstance"></param>
        public CachedInvoiceRecordRepository(IInvoiceRecordRepository innerRepository, RedisInstance redisInstance)
            : base(innerRepository, redisInstance)
        {
            _innerSpecificRepository = innerRepository;
        }
        #endregion

        //------------------------------------------------------------------------------------------//
        public async Task<System.Collections.Generic.List<InvoiceRecord>> GetByClientIdAsync(Guid clientId)
        {
            var cacheKey = $"invoice_record_client_{clientId}";
            var cachedData = await _redisDatabase.StringGetAsync(cacheKey);

            if (!cachedData.IsNullOrEmpty)
            {
                return JsonSerializer.Deserialize<System.Collections.Generic.List<InvoiceRecord>>((string)cachedData!) ?? new System.Collections.Generic.List<InvoiceRecord>();
            }

            var invoices = await _innerSpecificRepository.GetByClientIdAsync(clientId);

            if (invoices != null && invoices.Count > 0)
            {
                var serializedData = JsonSerializer.Serialize(invoices);
                await _redisDatabase.StringSetAsync(cacheKey, serializedData, TimeSpan.FromMinutes(30));
            }

            return invoices ?? new System.Collections.Generic.List<InvoiceRecord>();
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
