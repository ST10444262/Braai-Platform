using Inflame_Backend.Features.Client.Commands;
using Inflame_Backend.Features.Client.DTOs;
using Inflame_Backend.Features.Client.Queries;
using Inflame_Backend.Models.CRM;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inflame_Backend.Controllers.Admin
{
    /// <summary>
    /// API Controller for managing CRM operations such as Client Directory.
    /// </summary>
    [ApiController]
    [Route("api/admin/crm")]
    [Authorize(Roles = "SuperAdmin,Admin,Employee")]
    public class CRMController : ControllerBase
    {
        private readonly IMediator _mediator;

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Initializes the CRMController with MediatR.
        /// </summary>
        public CRMController(IMediator mediator)
        {
            _mediator = mediator;
        }

        #region Client Management

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Gets a list of clients or a single client by ID.
        /// </summary>
        [HttpGet("clients")]
        public async Task<ActionResult<IEnumerable<Client>>> GetClients([FromQuery] GetAdminClientQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Creates a new client.
        /// </summary>
        [HttpPost("clients")]
        public async Task<ActionResult<CreateClientResponseDto>> CreateClient([FromBody] CreateClientRequestDto requestDto)
        {
            var command = new CreateClientCommand(requestDto);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Updates an existing client.
        /// </summary>
        [HttpPut("clients/{id}")]
        public async Task<ActionResult<UpdateClientResponseDto>> UpdateClient(Guid id, [FromBody] UpdateClientRequestDto requestDto)
        {
            if (id != requestDto.ClientId)
            {
                return BadRequest("ID mismatch.");
            }

            var command = new UpdateClientCommand(requestDto);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Deletes a client.
        /// </summary>
        [HttpDelete("clients/{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<DeleteClientResponseDto>> DeleteClient(Guid id)
        {
            var command = new DeleteClientCommand(id);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Uploads an invoice document for a specific client.
        /// </summary>
        [HttpPost("clients/{id}/invoices")]
        public async Task<ActionResult<UploadInvoiceResponseDto>> UploadInvoice(Guid id, [FromForm] UploadInvoiceRequestDto requestDto)
        {
            var command = new UploadClientInvoiceCommand(id, requestDto);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Adds an internal note to a client.
        /// </summary>
        [HttpPost("clients/{id}/notes")]
        public async Task<ActionResult<AddClientNoteResponseDto>> AddNote(Guid id, [FromBody] AddClientNoteRequestDto requestDto)
        {
            var command = new AddClientNoteCommand(id, requestDto);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Deletes an internal note from a client.
        /// </summary>
        [HttpDelete("clients/{id}/notes/{noteId}")]
        public async Task<ActionResult<DeleteClientNoteResponseDto>> DeleteNote(Guid id, Guid noteId)
        {
            var command = new DeleteClientNoteCommand(noteId);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Deletes an invoice from a client and removes it from storage.
        /// </summary>
        [HttpDelete("clients/{id}/invoices/{invoiceId}")]
        public async Task<ActionResult<DeleteClientInvoiceResponseDto>> DeleteInvoice(Guid id, Guid invoiceId)
        {
            var command = new DeleteClientInvoiceCommand(invoiceId);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        #endregion
    }
}
//---------------------END OF FILE------------------------------------------------------------------//