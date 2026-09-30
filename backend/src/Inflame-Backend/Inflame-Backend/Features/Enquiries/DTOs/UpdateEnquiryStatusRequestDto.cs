namespace Inflame_Backend.Features.Enquiries.DTOs
{
    /// <summary>
    /// Payload for updating the status of an enquiry.
    /// </summary>
    public class UpdateEnquiryStatusRequestDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
