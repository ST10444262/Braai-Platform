namespace Inflame_Backend.Features.Product.DTOs
{
    /// <summary>
    /// Response after attempting to delete a product.
    /// </summary>
    public class DeleteProductResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
