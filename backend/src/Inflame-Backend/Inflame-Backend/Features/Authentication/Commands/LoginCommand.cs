using Inflame_Backend.Features.Authentication.DTOs;
using Inflame_Backend.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Inflame_Backend.Features.Authentication.Commands
{
    /// <summary>
    /// MediatR command and handler for authenticating users.
    /// Validates credentials, checks account active status and 2FA requirements,
    /// and generates a signed JWT upon successful login.
    /// </summary>
    public record LoginCommand(
        string Email,
        string Password
    ) : IRequest<LoginResponseDto>;


    public class LoginCommandHandler
        : IRequestHandler<LoginCommand, LoginResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtTokenService _jwtTokenService;

        public LoginCommandHandler(
            UserManager<ApplicationUser> userManager,
            JwtTokenService jwtTokenService)
        {
            _userManager = userManager;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<LoginResponseDto> Handle(
            LoginCommand request,
            CancellationToken cancellationToken)
        {
            var user =
                await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password."
                };
            }

            if (!user.IsActive)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "This account is inactive."
                };
            }

            var passwordValid =
                await _userManager.CheckPasswordAsync(
                    user,
                    request.Password);

            if (!passwordValid)
            {
                return new LoginResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password."
                };
            }

            var twoFactorEnabled =
                await _userManager.GetTwoFactorEnabledAsync(user);

            if (twoFactorEnabled)
            {
                return new LoginResponseDto
                {
                    Success = true,
                    RequiresTwoFactor = true,
                    Message = "Two-factor authentication is required."
                };
            }

            var token =
                await _jwtTokenService.GenerateTokenAsync(user);

            return new LoginResponseDto
            {
                Success = true,
                RequiresTwoFactor = false,
                Message = "Login successful.",
                Token = token
            };
        }
    }
}