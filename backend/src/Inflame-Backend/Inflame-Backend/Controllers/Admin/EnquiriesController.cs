using Inflame_Backend.Features.Enquiries.Queries;
using Inflame_Backend.Models.CRM;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/enquiries")]
    [Authorize(Roles = "SuperAdmin,Admin,Employee")]
    public class EnquiriesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public EnquiriesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        //------------------------------------------------------------------------------------------//
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnquiryResponseDto>>> GetEnquiries(
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new GetAdminEnquiryQuery
            {
                Status = status,
                PageNumber = Math.Max(page, 1),
                PageSize = Math.Clamp(pageSize, 1, 100)
            }, ct);

            return Ok(result.Select(e => new EnquiryResponseDto(e)));
        }

        //------------------------------------------------------------------------------------------//
       
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<EnquiryResponseDto>> GetEnquiry(Guid id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetAdminEnquiryQuery { EnquiryId = id }, ct);
            var enquiry = result.FirstOrDefault();

            return enquiry == null ? NotFound() : Ok(new EnquiryResponseDto(enquiry));
        }
    }

    //------------------------------------------------------------------------------------------//
    public class EnquiryResponseDto
    {
        public Guid Id { get; set; }
        public string EnquiryType { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public Guid? ProductId { get; set; }
        public string? ProductName { get; set; }
        public Guid? CustomOptionId { get; set; }
        public Guid? ClientId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public EnquiryResponseDto() { }

        public EnquiryResponseDto(Enquiry e)
        {
            Id = e.EnquiryId;
            EnquiryType = e.EnquiryType;
            FirstName = e.FirstName;
            LastName = e.LastName;
            Email = e.Email;
            Phone = e.Phone;
            ProductId = e.ProductId;
            ProductName = e.Product?.Name;
            CustomOptionId = e.CustomOptionId;
            ClientId = e.ClientId;
            Message = e.Message;
            Status = e.Status;
            CreatedAt = e.CreatedAt;
            UpdatedAt = e.UpdatedAt;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//