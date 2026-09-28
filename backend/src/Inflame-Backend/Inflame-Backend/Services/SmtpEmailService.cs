using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace Inflame_Backend.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        //------------------------------------------------------------------------------------------//
        public SmtpEmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Sends an email using MailKit and SMTP settings from configuration.
        /// </summary>
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var emailMessage = new MimeMessage();
            var fromEmail = _configuration["EmailSettings:FromEmail"] ?? string.Empty;
            var fromName = _configuration["EmailSettings:FromName"] ?? string.Empty;
            
            emailMessage.From.Add(new MailboxAddress(fromName, fromEmail));
            emailMessage.To.Add(new MailboxAddress("", toEmail));
            emailMessage.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = body };
            emailMessage.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            
            var smtpServer = _configuration["EmailSettings:SmtpServer"] ?? string.Empty;
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var smtpUser = _configuration["EmailSettings:SmtpUsername"] ?? string.Empty;
            var smtpPass = _configuration["EmailSettings:SmtpPassword"] ?? string.Empty;

            await client.ConnectAsync(smtpServer, smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtpUser, smtpPass);
            await client.SendAsync(emailMessage);
            await client.DisconnectAsync(true);
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
