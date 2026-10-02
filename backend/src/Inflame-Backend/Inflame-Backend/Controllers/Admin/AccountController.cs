using Inflame_Backend.Features.Authentication.Commands;
using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Features.Staff.Commands;
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

        //------------------------------------------------------------------------------------------//
        public AccountController(IMediator mediator)
        {
            _mediator = mediator;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Authenticates a staff member and returns a JWT or a two-factor challenge.
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
                request.Challenge,
                request.Code,
                request.RememberDevice);

            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Generates two-factor authentication setup details (shared key and formatted QR URI) using a setup challenge token.
        /// </summary>
        [HttpPost("2fa/setup")]
        [AllowAnonymous]
        public async Task<ActionResult<SetupTwoFactorResponseDto>> SetupTwoFactor(
            [FromBody] SetupTwoFactorRequestDto request)
        {
            var command = new SetupTwoFactorCommand(
                request.Challenge);

            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Verifies the provided 6-digit authenticator code and enables two-factor authentication for the user using a setup challenge token.
        /// </summary>
        [HttpPost("2fa/verify")]
        [AllowAnonymous]
        public async Task<ActionResult<VerifyTwoFactorResponseDto>> VerifyTwoFactor(
            [FromBody] VerifyTwoFactorRequestDto request)
        {
            var command = new VerifyTwoFactorCommand(
                request.Challenge,
                request.Code);

            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Resets two-factor authentication for a staff member.
        /// Restricted to SuperAdmins and Admins.
        /// </summary>
        [HttpPost("2fa/reset")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<ResetTwoFactorResponseDto>> ResetTwoFactor(
            [FromBody] ResetTwoFactorRequestDto request)
        {
            var command = new ResetTwoFactorCommand(
                request.UserId);

            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Provisions a new staff account. SuperAdmins can create Admins or Employees. Admins can only create Employees.
        /// Accepts multipart/form-data for uploading optional profile images.
        /// </summary>
        [HttpPost("staff")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<CreateStaffAccountResponseDto>> CreateStaff(
            [FromForm] CreateStaffAccountRequestDto request)
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
                requestedRole,
                request.ProfileImage);

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
    }
}
//---------------------END OF FILE------------------------------------------------------------------//