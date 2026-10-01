using Inflame_Backend.Data.Adapters;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Features.Client.DTOs;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Client.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Command to delete a client's invoice.
    /// </summary>
    public record DeleteClientInvoiceCommand(Guid InvoiceId) : IRequest<DeleteClientInvoiceResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the deletion of an invoice from the database and storage.
    /// </summary>
    public class DeleteClientInvoiceCommandHandler : IRequestHandler<DeleteClientInvoiceCommand, DeleteClientInvoiceResponseDto>
    {
        private readonly IInvoiceRecordRepository _invoiceRecordRepository;
        private readonly IStorageAdapter _storageAdapter;

        //------------------------------------------------------------------------------------------//
        public DeleteClientInvoiceCommandHandler(
            IInvoiceRecordRepository invoiceRecordRepository,
            IStorageAdapter storageAdapter)
        {
            _invoiceRecordRepository = invoiceRecordRepository;
            _storageAdapter = storageAdapter;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<DeleteClientInvoiceResponseDto> Handle(DeleteClientInvoiceCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var invoice = await _invoiceRecordRepository.GetByIdAsync(request.InvoiceId);
                if (invoice == null)
                {
                    return new DeleteClientInvoiceResponseDto { Success = false, Message = "Invoice not found." };
                }

                // Delete from storage first
                var uri = new Uri(invoice.FileUrl);
                var segments = uri.Segments;
                var uniqueFileName = Uri.UnescapeDataString(segments[segments.Length - 1]);

                await _storageAdapter.DeleteFileAsync("invoices", uniqueFileName);

                // Delete from DB
                await _invoiceRecordRepository.DeleteAsync(invoice);

                return new DeleteClientInvoiceResponseDto { Success = true, Message = "Invoice deleted successfully." };
            }
            catch (Exception ex)
            {
                return new DeleteClientInvoiceResponseDto { Success = false, Message = $"Error: {ex.Message}" };
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
