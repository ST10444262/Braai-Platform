namespace Inflame_Backend.Features.Enquiries.DTOs
{
    /// <summary>
    /// Response after updating the status of an enquiry.
    /// </summary>
    public class UpdateEnquiryStatusResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
