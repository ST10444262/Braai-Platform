using Inflame_Backend.Features.Enquiries.Commands;
using Inflame_Backend.Features.Enquiries.DTOs;
using Inflame_Backend.Features.Enquiries.Queries;
using Inflame_Backend.Models.CRM;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Admin
{
    /// <summary>
    /// API Controller for managing Enquiries from the Admin portal.
    /// </summary>
    [ApiController]
    [Route("api/admin/enquiries")]
    [Authorize(Roles = "SuperAdmin,Admin,Employee")]
    public class EnquiriesController : ControllerBase
    {
        private readonly IMediator _mediator;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the EnquiriesController with MediatR.
        /// </summary>
        public EnquiriesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves a paginated list of enquiries, optionally filtered by status, or a specific enquiry by ID.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Enquiry>>> GetEnquiries([FromQuery] GetAdminEnquiryQuery query)
        {
            var result = await _mediator.Send(query);

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Updates the status of a specific enquiry.
        /// </summary>
        [HttpPut("{enquiryId}/status")]
        public async Task<ActionResult<UpdateEnquiryStatusResponseDto>> UpdateStatus(
            [FromRoute] Guid enquiryId, 
            [FromBody] UpdateEnquiryStatusRequestDto request)
        {
            var command = new UpdateEnquiryStatusCommand(enquiryId, request.Status);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//