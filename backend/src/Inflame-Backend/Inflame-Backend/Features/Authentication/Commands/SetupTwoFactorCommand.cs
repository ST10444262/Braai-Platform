using System.Security.Claims;
using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Authentication.Commands
{
    public record SetupTwoFactorCommand(
        Guid UserId
    ) : IRequest<SetupTwoFactorResponseDto>;

    public class SetupTwoFactorCommandHandler
        : IRequestHandler<SetupTwoFactorCommand, SetupTwoFactorResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public SetupTwoFactorCommandHandler(
            UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<SetupTwoFactorResponseDto> Handle(
            SetupTwoFactorCommand request,
            CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(
                request.UserId.ToString());

            if (user == null)
            {
                return new SetupTwoFactorResponseDto
                {
                    Success = false,
                    Message = "User not found."
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