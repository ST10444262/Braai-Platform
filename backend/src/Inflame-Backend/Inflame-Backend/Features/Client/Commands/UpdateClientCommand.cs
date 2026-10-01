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
    /// Command to update an existing client.
    /// </summary>
    public record UpdateClientCommand(UpdateClientRequestDto RequestDto) : IRequest<UpdateClientResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the update of an existing client.
    /// </summary>
    public class UpdateClientCommandHandler : IRequestHandler<UpdateClientCommand, UpdateClientResponseDto>
    {
        private readonly IClientRepository _clientRepository;

        //------------------------------------------------------------------------------------------//
        public UpdateClientCommandHandler(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<UpdateClientResponseDto> Handle(UpdateClientCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var client = await _clientRepository.GetByIdAsync(request.RequestDto.ClientId);
                if (client == null)
                {
                    return new UpdateClientResponseDto { Success = false, Message = "Client not found." };
                }

                var names = request.RequestDto.FullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                client.FirstName = names.Length > 0 ? names[0] : "";
                client.LastName = names.Length > 1 ? names[1] : "";
                client.Email = request.RequestDto.Email;
                client.Phone = request.RequestDto.Phone;
                client.PhysicalAddress = request.RequestDto.PhysicalAddress;

                await _clientRepository.UpdateAsync(client);

                return new UpdateClientResponseDto { Success = true, Message = "Client updated successfully." };
            }
            catch (Exception ex)
            {
                return new UpdateClientResponseDto { Success = false, Message = $"Error: {ex.Message}" };
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
