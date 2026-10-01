using Inflame_Backend.Data.Adapters;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Features.Client.DTOs;
using Inflame_Backend.Models.CRM;
using MediatR;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Client.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Command to upload a new invoice for a client.
    /// </summary>
    public record UploadClientInvoiceCommand(Guid ClientId, UploadInvoiceRequestDto RequestDto) : IRequest<UploadInvoiceResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the upload of a client invoice to Supabase storage.
    /// </summary>
    public class UploadClientInvoiceCommandHandler : IRequestHandler<UploadClientInvoiceCommand, UploadInvoiceResponseDto>
    {
        private readonly IInvoiceRecordRepository _invoiceRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IStorageAdapter _storageAdapter;

        //------------------------------------------------------------------------------------------//
        public UploadClientInvoiceCommandHandler(
            IInvoiceRecordRepository invoiceRepository, 
            IClientRepository clientRepository,
            IStorageAdapter storageAdapter)
        {
            _invoiceRepository = invoiceRepository;
            _clientRepository = clientRepository;
            _storageAdapter = storageAdapter;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<UploadInvoiceResponseDto> Handle(UploadClientInvoiceCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var client = await _clientRepository.GetByIdAsync(request.ClientId);
                if (client == null)
                {
                    return new UploadInvoiceResponseDto { Success = false, Message = "Client not found." };
                }

                var files = request.RequestDto.Files;
                if (files == null || files.Count == 0)
                {
                    return new UploadInvoiceResponseDto { Success = false, Message = "No files provided." };
                }

                var response = new UploadInvoiceResponseDto { Success = true, Message = "Invoices uploaded successfully." };

                foreach (var file in files)
                {
                    if (file.Length == 0) continue;

                    var extension = Path.GetExtension(file.FileName);
                    var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    
                    using var memoryStream = new MemoryStream();
                    await file.CopyToAsync(memoryStream, cancellationToken);
                    var fileBytes = memoryStream.ToArray();

                    // Upload to Supabase storage via the adapter (using "invoices" bucket)
                    await _storageAdapter.UploadFileAsync("invoices", uniqueFileName, fileBytes);
                    
                    var publicUrl = _storageAdapter.GetFileUrl("invoices", uniqueFileName);

                    var invoiceRecord = new InvoiceRecord
                    {
                        InvoiceId = Guid.NewGuid(),
                        ClientId = request.ClientId,
                        StaffAccountId = request.RequestDto.StaffAccountId,
                        FileName = file.FileName,
                        FileUrl = publicUrl,
                        UploadedAt = DateTime.UtcNow
                    };

                    await _invoiceRepository.AddAsync(invoiceRecord);

                    response.UploadedInvoices.Add(new UploadedInvoiceDto
                    {
                        InvoiceId = invoiceRecord.InvoiceId,
                        FileName = invoiceRecord.FileName,
                        FileUrl = invoiceRecord.FileUrl
                    });
                }

                return response;
            }
            catch (Exception ex)
            {
                return new UploadInvoiceResponseDto { Success = false, Message = $"Error: {ex.Message}" };
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
