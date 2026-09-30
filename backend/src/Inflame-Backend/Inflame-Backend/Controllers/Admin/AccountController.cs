using Inflame_Backend.Features.Authentication.Commands;
using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Features.Staff.Queries;
using Inflame_Backend.Models.CRM;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        //------------------------------------------------------------------------------------------//
        public AccountController(IMediator mediator)
        {
            _mediator = mediator;
        }
        //------------------------------------------------------------------------------------------//
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
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Verifies the 2FA code during the secondary login step and issues the final JWT.
        /// </summary>
        [HttpPost("login/2fa")]
        [AllowAnonymous]
        public async Task<ActionResult<VerifyLoginTwoFactorResponseDto>> VerifyLoginTwoFactor(
            [FromBody] VerifyLoginTwoFactorRequestDto request)
        {
            var command = new VerifyLoginTwoFactorCommand(
                request.UserId,
                request.Code);

            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Provisions a new staff account. SuperAdmins can create Admins or Employees. Admins can only create Employees.
        /// </summary>
        [HttpPost("staff")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<CreateStaffAccountResponseDto>> CreateStaff(
            [FromBody] CreateStaffAccountRequestDto request)
        {
            var requestedRole = string.IsNullOrWhiteSpace(request.Role) ? "Employee" : request.Role;

            if (requestedRole == "SuperAdmin")
            {
                return Forbid();
            }

            if (requestedRole == "Admin" && !User.IsInRole("SuperAdmin"))
            {
                return Forbid();
            }

            var command = new CreateStaffAccountCommand(
                request.Email,
                request.Password,
                request.FullName,
                requestedRole);

            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        //------------------------------------------------------------------------------------------//
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
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Generates two-factor authentication setup details (shared key and formatted QR URI) for Microsoft Authenticator.
        /// </summary>
        [HttpPost("2fa/setup")]
        [Authorize]
        public async Task<ActionResult<SetupTwoFactorResponseDto>> SetupTwoFactor()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null ||
                !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new
                {
                    message = "Unable to identify the authenticated user."
                });
            }

            var command = new SetupTwoFactorCommand(userId);

            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Verifies the provided 6-digit authenticator code and enables two-factor authentication for the user.
        /// </summary>
        [HttpPost("2fa/verify")]
        [Authorize]
        public async Task<ActionResult<VerifyTwoFactorResponseDto>> VerifyTwoFactor(
            [FromBody] VerifyTwoFactorRequestDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null ||
                !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new
                {
                    message = "Unable to identify the authenticated user."
                });
            }

            var command = new VerifyTwoFactorCommand(
                userId,
                request.Code);

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