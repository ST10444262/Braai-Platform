using Inflame_Backend.Features.Authentication.Commands;
using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Features.Staff.Queries;
using Inflame_Backend.Models.CRM;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Admin
{
    /// <summary>
    /// Handles authentication and staff account management.
    /// </summary>
    [ApiController]
    [Route("api/admin/account")]
    public class AccountController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AccountController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Authenticates a staff member and returns a JWT.
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDto>> Login(
            [FromBody] LoginRequestDto request)
        {
            var command = new LoginCommand(
                request.Email,
                request.Password);

            var result =
                await _mediator.Send(command);

            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Provisions a new staff account with an Employee role.
        /// Restricted to SuperAdmin authorization.
        /// </summary>
        [HttpPost("staff")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<CreateStaffAccountResponseDto>> CreateStaff(
            [FromBody] CreateStaffAccountRequestDto request)
        {
            var command = new CreateStaffAccountCommand(
                request.Email,
                request.Password,
                request.FullName);

            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Retrieves staff accounts using query parameters.
        /// Restricted to SuperAdmin and Admin authorization.
        /// </summary>
        [HttpGet("staff")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<IEnumerable<StaffAccount>>> GetStaff(
            [FromQuery] GetAdminStaffQuery query)
        {
            var result = await _mediator.Send(query);

            return Ok(result);
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//