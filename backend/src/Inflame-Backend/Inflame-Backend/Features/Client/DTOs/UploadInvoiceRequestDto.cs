using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Inflame_Backend.Features.Client.DTOs
{
    public class UploadInvoiceRequestDto
    {
        [Required]
        public List<IFormFile> Files { get; set; } = new List<IFormFile>();

        [Required]
        public Guid StaffAccountId { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
