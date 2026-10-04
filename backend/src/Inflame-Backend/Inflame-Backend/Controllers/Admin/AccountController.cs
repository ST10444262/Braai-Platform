using System.Security.Claims;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Features.Authentication.Commands;
using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Features.Staff.Commands;
using Inflame_Backend.Features.Staff.Queries;
using Inflame_Backend.Identity;
using Inflame_Backend.Models.CRM;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Inflame_Backend.Controllers.Admin
{
    /// <summary>
    /// Request body for changing the signed-in user's password.
    /// </summary>
    public record ChangePasswordRequestDto(string CurrentPassword, string NewPassword);

    /// <summary>
    /// Request body for changing user preferences.
    /// </summary>
    public record UpdatePreferencesRequestDto(bool ReceiveQuoteEmails);

    /// <summary>
    /// Handles authentication and staff account management.
    /// </summary>
    [ApiController]
    [Route("api/admin/account")]
    public class AccountController : ControllerBase
    {
        private readonly IMediator _mediator;

        #region Dependencies

        //------------------------------------------------------------------------------------------//
        private readonly Inflame_Backend.Services.Authentication.TrustedDeviceService _trustedDeviceService;
        private readonly Inflame_Backend.Services.Authentication.TwoFactorChallengeService _twoFactorChallengeService;

        //------------------------------------------------------------------------------------------//
        public AccountController(
            IMediator mediator,
            Inflame_Backend.Services.Authentication.TrustedDeviceService trustedDeviceService,
            Inflame_Backend.Services.Authentication.TwoFactorChallengeService twoFactorChallengeService)
        {
            _mediator = mediator;
            _trustedDeviceService = trustedDeviceService;
            _twoFactorChallengeService = twoFactorChallengeService;
        }
        #endregion

        #region Authentication Endpoints
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
        #endregion

        #region Profile Endpoints
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Returns the signed-in user's staff profile (including the StaffId needed for notes and invoice uploads).
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (idClaim == null || !Guid.TryParse(idClaim.Value, out var userId))
            {
                return Unauthorized();
            }

            var query = new GetStaffProfileQuery(userId);
            var result = await _mediator.Send(query);

            if (!result.Success)
            {
                return NotFound(new { message = result.Message });
            }

            return Ok(new
            {
                staffId = result.StaffId,
                email = result.Email,
                fullName = result.FullName,
                role = result.Role,
                twoFactorEnabled = result.TwoFactorEnabled,
                receiveQuoteEmails = result.ReceiveQuoteEmails
            });
        }
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Changes the signed-in user's password.
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(
            [FromBody] ChangePasswordRequestDto request)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (idClaim == null || !Guid.TryParse(idClaim.Value, out var userId))
            {
                return Unauthorized();
            }

            var command = new ChangePasswordCommand(
                userId,
                request.CurrentPassword,
                request.NewPassword);

            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(new
                {
                    success = false,
                    message = result.Message
                });
            }

            return Ok(new { success = true, message = result.Message });
        }
        
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Updates the signed-in user's preferences.
        /// </summary>
        [HttpPut("me/preferences")]
        [Authorize]
        public async Task<IActionResult> UpdatePreferences(
            [FromBody] UpdatePreferencesRequestDto request)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (idClaim == null || !Guid.TryParse(idClaim.Value, out var userId))
            {
                return Unauthorized();
            }

            var command = new UpdateStaffPreferencesCommand(userId, request.ReceiveQuoteEmails);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return NotFound(new { success = false, message = result.Message });
            }

            return Ok(new { success = true, message = result.Message });
        }
        
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves active trusted devices for the signed-in user.
        /// </summary>
        [HttpGet("me/devices")]
        [Authorize]
        public async Task<IActionResult> GetTrustedDevices()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null || !Guid.TryParse(idClaim.Value, out var userId))
                return Unauthorized();

            var devices = await _trustedDeviceService.GetActiveDevicesAsync(userId);
            return Ok(devices.Select(d => new
            {
                id = d.Id,
                deviceName = d.DeviceName,
                ipAddress = d.IpAddress,
                createdAt = d.CreatedAt,
                lastUsedAt = d.LastUsedAt,
                expiresAt = d.ExpiresAt
            }));
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Revokes a trusted device for the signed-in user.
        /// </summary>
        [HttpDelete("me/devices/{deviceId:guid}")]
        [Authorize]
        public async Task<IActionResult> RevokeTrustedDevice(Guid deviceId)
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null || !Guid.TryParse(idClaim.Value, out var userId))
                return Unauthorized();

            var success = await _trustedDeviceService.RevokeDeviceAsync(userId, deviceId);
            if (!success)
                return NotFound(new { message = "Device not found or not owned by user." });

            return Ok(new { success = true, message = "Device revoked successfully." });
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initiates the 2FA setup process for an already logged-in user.
        /// </summary>
        [HttpPost("me/2fa/setup")]
        [Authorize]
        public async Task<IActionResult> SelfSetupTwoFactor()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null || !Guid.TryParse(idClaim.Value, out var userId))
                return Unauthorized();

            var challenge = _twoFactorChallengeService.CreateChallenge(userId, "setup");
            var command = new SetupTwoFactorCommand(challenge);
            var result = await _mediator.Send(command);

            if (!result.Success)
                return BadRequest(result);

            // We also return the challenge token so they can submit it back to verify
            return Ok(new { 
                success = result.Success, 
                message = result.Message, 
                sharedKey = result.SharedKey, 
                authenticatorUri = result.AuthenticatorUri,
                challengeToken = challenge
            });
        }
        #endregion

        #region Staff Management Endpoints
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
        /// Updates an existing staff account. Admins can only update Employees, while SuperAdmins can update Admins and Employees.
        /// Accepts multipart/form-data for optional profile image replacement.
        /// </summary>
        [HttpPut("staff/{staffId:guid}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<UpdateStaffAccountResponseDto>> UpdateStaff(
            Guid staffId,
            [FromForm] UpdateStaffAccountRequestDto request)
        {
            var requestedRole =
                string.IsNullOrWhiteSpace(request.Role)
                    ? "Employee"
                    : request.Role;

            var requestingRole = User.IsInRole("SuperAdmin") ? "SuperAdmin" : "Admin";

            var command = new UpdateStaffAccountCommand(
                staffId,
                request.Email,
                request.FullName,
                requestedRole,
                request.IsActive,
                request.NewPassword,
                request.ProfileImage,
                requestingRole);

            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                if (result.Message != null && (
                    result.Message.Contains("Forbidden", StringComparison.OrdinalIgnoreCase) ||
                    result.Message.Contains("cannot be assigned", StringComparison.OrdinalIgnoreCase) ||
                    result.Message.Contains("cannot be edited", StringComparison.OrdinalIgnoreCase)))
                {
                    return StatusCode(403, result);
                }
                return BadRequest(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Deletes a staff account.
        /// Admins may delete Employees only.
        /// SuperAdmins may delete Employees and Admins.
        /// SuperAdmin accounts and the requesting user's own account are protected.
        /// </summary>
        [HttpDelete("staff/{staffId:guid}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<DeleteStaffAccountResponseDto>> DeleteStaff(
            Guid staffId)
        {
            var requestingUserIdString =
                User.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(
                    requestingUserIdString,
                    out var requestingUserId))
            {
                return Unauthorized(new
                {
                    message = "Unable to determine the requesting user."
                });
            }

            var requestingRole =
                User.IsInRole("SuperAdmin")
                    ? "SuperAdmin"
                    : "Admin";

            var command = new DeleteStaffAccountCommand(
                staffId,
                requestingUserId,
                requestingRole);

            var result =
                await _mediator.Send(command);

            if (!result.Success)
            {
                if (result.Message != null && (
                    result.Message.Contains("cannot delete your own", StringComparison.OrdinalIgnoreCase) ||
                    result.Message.Contains("cannot be deleted", StringComparison.OrdinalIgnoreCase) ||
                    result.Message.Contains("Admins can only delete Employee", StringComparison.OrdinalIgnoreCase)))
                {
                    return StatusCode(403, result);
                }
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
        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//