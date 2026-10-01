using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Features.Client.DTOs;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Client.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Command to delete a client.
    /// </summary>
    public record DeleteClientCommand(Guid ClientId) : IRequest<DeleteClientResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the deletion of a client.
    /// </summary>
    public class DeleteClientCommandHandler : IRequestHandler<DeleteClientCommand, DeleteClientResponseDto>
    {
        private readonly IClientRepository _clientRepository;

        //------------------------------------------------------------------------------------------//
        public DeleteClientCommandHandler(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<DeleteClientResponseDto> Handle(DeleteClientCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var client = await _clientRepository.GetByIdAsync(request.ClientId);
                if (client == null)
                {
                    return new DeleteClientResponseDto { Success = false, Message = "Client not found." };
                }

                await _clientRepository.DeleteAsync(client);

                return new DeleteClientResponseDto { Success = true, Message = "Client deleted successfully." };
            }
            catch (Exception ex)
            {
                return new DeleteClientResponseDto { Success = false, Message = $"Error: {ex.Message}" };
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
