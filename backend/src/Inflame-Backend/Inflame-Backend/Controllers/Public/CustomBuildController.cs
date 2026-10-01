using Microsoft.AspNetCore.Mvc;
using MediatR;
using System.Threading.Tasks;
using Inflame_Backend.Features.CustomBuild.DTOs;
using Inflame_Backend.Features.CustomBuild.Commands;
using System;

namespace Inflame_Backend.Controllers.Public
{
    /// <summary>
    /// Controller for managing custom builds, including actions for creating, viewing, and managing custom build configurations.
    /// </summary>
    [ApiController]
    [Route("api/public/customBuilds")]
    public class CustomBuildController : ControllerBase
    {
        private readonly IMediator _mediator;

        //------------------------------------------------------------------------------------------//
        public CustomBuildController(IMediator mediator)
        {
            _mediator = mediator;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Submits a new custom build enquiry.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Guid>> SubmitCustomBuild([FromBody] CustomBuildRequestDto request)
        {
            var command = new CreateCustomBuildCommand(request);
            var enquiryId = await _mediator.Send(command);

            return Ok(enquiryId);
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//