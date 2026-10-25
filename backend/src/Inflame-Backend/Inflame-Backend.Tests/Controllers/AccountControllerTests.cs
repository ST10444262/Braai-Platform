using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Inflame_Backend.Controllers.Admin;
using Inflame_Backend.Features.Authentication.Commands;
using Inflame_Backend.Features.Authentication.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace Inflame_Backend.Tests.Controllers
{
    //----------------------------------------------------------------------------------------------//
    /// <summary>
    /// Unit tests for AccountController authentication and cookie management.
    /// Verifies that tokens are issued via httpOnly cookies to prevent XSS credential theft.
    /// </summary>
    public class AccountControllerTests
    {
        private readonly Mock<IMediator> _mockMediator;
        private readonly AccountController _controller;
        private readonly DefaultHttpContext _httpContext;

        public AccountControllerTests()
        {
            _mockMediator = new Mock<IMediator>();
            _controller = new AccountController(
                _mockMediator.Object,
                null!,
                null!);

            _httpContext = new DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = _httpContext
            };
        }

        //------------------------------------------------------------------------------------------//
        [Fact]
        public async Task Login_WhenSuccessfulWithToken_SetsHttpOnlyCookie()
        {
            // Arrange
            var expectedToken = "secure.jwt.token";
            var responseDto = new LoginResponseDto
            {
                Success = true,
                Token = expectedToken,
                ExpiresAt = DateTime.UtcNow.AddHours(2)
            };

            _mockMediator
                .Setup(m => m.Send(It.IsAny<LoginCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(responseDto);

            var request = new LoginRequestDto { Email = "admin@inflame.co.za", Password = "ValidPass123!" };

            // Act
            var actionResult = await _controller.Login(request);

            // Assert
            var okResult = actionResult.Result as OkObjectResult;
            okResult.Should().NotBeNull();

            var setCookieHeader = _httpContext.Response.Headers["Set-Cookie"].ToString();
            setCookieHeader.Should().Contain(AccountController.AuthCookieName);
            setCookieHeader.Should().Contain(expectedToken);
            setCookieHeader.Should().Contain("httponly");
        }

        //------------------------------------------------------------------------------------------//
        [Fact]
        public async Task Login_WhenRequiresTwoFactor_DoesNotSetCookie()
        {
            // Arrange
            var responseDto = new LoginResponseDto
            {
                Success = true,
                RequiresTwoFactor = true,
                TwoFactorChallenge = "challenge-123"
            };

            _mockMediator
                .Setup(m => m.Send(It.IsAny<LoginCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(responseDto);

            var request = new LoginRequestDto { Email = "admin@inflame.co.za", Password = "ValidPass123!" };

            // Act
            var actionResult = await _controller.Login(request);

            // Assert
            var okResult = actionResult.Result as OkObjectResult;
            okResult.Should().NotBeNull();

            var setCookieHeader = _httpContext.Response.Headers["Set-Cookie"].ToString();
            setCookieHeader.Should().BeEmpty();
        }

        //------------------------------------------------------------------------------------------//
        [Fact]
        public async Task VerifyLoginTwoFactor_WhenSuccessful_SetsHttpOnlyCookie()
        {
            // Arrange
            var expectedToken = "2fa.verified.jwt";
            var responseDto = new VerifyLoginTwoFactorResponseDto
            {
                Success = true,
                Token = expectedToken,
                ExpiresAt = DateTime.UtcNow.AddHours(2)
            };

            _mockMediator
                .Setup(m => m.Send(It.IsAny<VerifyLoginTwoFactorCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(responseDto);

            var request = new VerifyLoginTwoFactorRequestDto { Challenge = "challenge", Code = "123456", RememberDevice = false };

            // Act
            var actionResult = await _controller.VerifyLoginTwoFactor(request);

            // Assert
            var okResult = actionResult.Result as OkObjectResult;
            okResult.Should().NotBeNull();

            var setCookieHeader = _httpContext.Response.Headers["Set-Cookie"].ToString();
            setCookieHeader.Should().Contain(AccountController.AuthCookieName);
            setCookieHeader.Should().Contain(expectedToken);
            setCookieHeader.Should().Contain("httponly");
        }

        //------------------------------------------------------------------------------------------//
        [Fact]
        public void Logout_ClearsHttpOnlyCookie()
        {
            // Act
            var actionResult = _controller.Logout();

            // Assert
            var okResult = actionResult as OkObjectResult;
            okResult.Should().NotBeNull();

            var setCookieHeader = _httpContext.Response.Headers["Set-Cookie"].ToString();
            setCookieHeader.Should().Contain(AccountController.AuthCookieName);
            // In ASP.NET Core, deleting a cookie sets an expiration in the past (e.g. 1970)
            setCookieHeader.Should().Contain("expires=Thu, 01 Jan 1970");
        }
    }
}
