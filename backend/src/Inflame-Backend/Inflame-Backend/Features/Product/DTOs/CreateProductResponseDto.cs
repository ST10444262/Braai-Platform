using System;

namespace Inflame_Backend.Features.Product.DTOs
{
    /// <summary>
    /// Response after attempting to create a product.
    /// </summary>
    public class CreateProductResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? ProductId { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
