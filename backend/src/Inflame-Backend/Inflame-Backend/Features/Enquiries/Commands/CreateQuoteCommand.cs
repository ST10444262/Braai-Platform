using MediatR;
using System;

namespace Inflame_Backend.Features.Enquiries.Commands
{
    public class CreateQuoteCommand : IRequest<string>
    {
        //------------------------------------------------------------------------------------------//
        public string FirstName { get; set; } = string.Empty;

        //------------------------------------------------------------------------------------------//
        public string LastName { get; set; } = string.Empty;
        
        //------------------------------------------------------------------------------------------//
        public string Email { get; set; } = string.Empty;

        //------------------------------------------------------------------------------------------//
        public string Phone { get; set; } = string.Empty;
        
        //------------------------------------------------------------------------------------------//
        public Guid? ProductId { get; set; }

        //------------------------------------------------------------------------------------------//
        public string Message { get; set; } = string.Empty;
    }
}
//---------------------END OF FILE------------------------------------------------------------------//