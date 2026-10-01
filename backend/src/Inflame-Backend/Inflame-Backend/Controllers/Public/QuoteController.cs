using Microsoft.AspNetCore.Mvc;
using MediatR;
using System.Threading.Tasks;
using Inflame_Backend.Features.Enquiries.Commands;

namespace Inflame_Backend.Controllers.Public
{
    /// <summary>
    /// API Controller for handling public quote requests for catalogue products.
    /// </summary>
    [ApiController]
    [Route("api/public/quotes")]
    public class QuoteController : ControllerBase
    {
        private readonly IMediator _mediator;

        //------------------------------------------------------------------------------------------//
        public QuoteController(IMediator mediator)
        {
            _mediator = mediator;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Submits a new quote enquiry for a specific catalogue product.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<string>> SubmitQuote([FromBody] CreateQuoteCommand command)
        {
            var result = await _mediator.Send(command);

            return Ok(result);
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
