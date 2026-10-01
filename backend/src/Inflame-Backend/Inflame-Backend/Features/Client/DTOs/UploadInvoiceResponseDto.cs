using System;
using System.Collections.Generic;

namespace Inflame_Backend.Features.Client.DTOs
{
    public class UploadInvoiceResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<UploadedInvoiceDto> UploadedInvoices { get; set; } = new List<UploadedInvoiceDto>();
    }

    public class UploadedInvoiceDto
    {
        public Guid InvoiceId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
