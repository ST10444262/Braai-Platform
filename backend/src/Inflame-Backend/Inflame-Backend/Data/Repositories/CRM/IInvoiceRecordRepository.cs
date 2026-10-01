using Inflame_Backend.Data.DataLayer;
using Inflame_Backend.Models.CRM;
using System;
using System.Threading.Tasks;

namespace Inflame_Backend.Data.Repositories.CRM
{
    /// <summary>
    /// Repository interface for InvoiceRecord entities.
    /// </summary>
    public interface IInvoiceRecordRepository : IBaseRepository<InvoiceRecord>
    {
        Task<System.Collections.Generic.List<InvoiceRecord>> GetByClientIdAsync(Guid clientId);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
