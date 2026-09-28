using System.Threading.Tasks;

namespace Inflame_Backend.Services
{
    public interface IEmailService
    {
        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Sends an email asynchronously.
        /// </summary>
        /// <param name="toEmail">The recipient's email address.</param>
        /// <param name="subject">The subject of the email.</param>
        /// <param name="body">The body of the email.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendEmailAsync(string toEmail, string subject, string body);

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Sends an email to multiple recipients using BCC asynchronously.
        /// Useful for high-volume notifications to prevent SMTP spam/rate limits.
        /// </summary>
        /// <param name="bccEmails">The list of recipient email addresses.</param>
        /// <param name="subject">The subject of the email.</param>
        /// <param name="body">The body of the email.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendEmailAsync(System.Collections.Generic.IEnumerable<string> bccEmails, string subject, string body);
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
