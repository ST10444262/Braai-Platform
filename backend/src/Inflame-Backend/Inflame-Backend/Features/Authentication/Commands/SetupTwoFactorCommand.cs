using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using Inflame_Backend.Services.Authentication;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Authentication.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// MediatR command and handler for setting up two factor authentication.
    /// </summary>
    public record SetupTwoFactorCommand(
        string Challenge
    ) : IRequest<SetupTwoFactorResponseDto>;

    //------------------------------------------------------------------------------------------//
    public class SetupTwoFactorCommandHandler
        : IRequestHandler<SetupTwoFactorCommand, SetupTwoFactorResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly TwoFactorChallengeService _twoFactorChallengeService;

        //------------------------------------------------------------------------------------------//
        public SetupTwoFactorCommandHandler(
            UserManager<ApplicationUser> userManager,
            TwoFactorChallengeService twoFactorChallengeService)
        {
            _userManager = userManager;
            _twoFactorChallengeService = twoFactorChallengeService;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Handles the setup two factor request.
        /// </summary>
        public async Task<SetupTwoFactorResponseDto> Handle(
            SetupTwoFactorCommand request,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Challenge))
            {
                return new SetupTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Two-factor setup challenge is required."
                };
            }

            var challengeIsValid =
                _twoFactorChallengeService.TryReadChallenge(
                    request.Challenge,
                    out var userId,
                    out var purpose);

            if (!challengeIsValid)
            {
                return new SetupTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Two-factor setup challenge is invalid or expired."
                };
            }

            if (purpose != "setup")
            {
                return new SetupTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Invalid two-factor setup challenge."
                };
            }

            var user = await _userManager.FindByIdAsync(
                userId.ToString());

            if (user == null)
            {
                return new SetupTwoFactorResponseDto
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            if (!user.IsActive)
            {
                return new SetupTwoFactorResponseDto
                {
                    Success = false,
                    Message = "User account is inactive."
                };
            }

            var key = await _userManager.GetAuthenticatorKeyAsync(user);

            if (string.IsNullOrWhiteSpace(key))
            {
                var resetResult =
                    await _userManager.ResetAuthenticatorKeyAsync(user);

                if (!resetResult.Succeeded)
                {
                    return new SetupTwoFactorResponseDto
                    {
                        Success = false,
                        Message = "Unable to generate an authenticator key."
                    };
                }

                key = await _userManager.GetAuthenticatorKeyAsync(user);
            }

            if (string.IsNullOrWhiteSpace(key))
            {
                return new SetupTwoFactorResponseDto
                {
                    Success = false,
                    Message = "Unable to retrieve the authenticator key."
                };
            }

            var email = user.Email ?? user.UserName ?? string.Empty;
            var issuer = "Inflame Backend";

            var authenticatorUri =
                $"otpauth://totp/" +
                $"{Uri.EscapeDataString(issuer)}:" +
                $"{Uri.EscapeDataString(email)}" +
                $"?secret={Uri.EscapeDataString(key)}" +
                $"&issuer={Uri.EscapeDataString(issuer)}" +
                $"&digits=6";

            return new SetupTwoFactorResponseDto
            {
                Success = true,
                Message = "Authenticator setup information generated.",
                SharedKey = key,
                AuthenticatorUri = authenticatorUri
            };
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//