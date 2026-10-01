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
    /// Command to create a new client.
    /// </summary>
    public record CreateClientCommand(CreateClientRequestDto RequestDto) : IRequest<CreateClientResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the creation of a new client.
    /// </summary>
    public class CreateClientCommandHandler : IRequestHandler<CreateClientCommand, CreateClientResponseDto>
    {
        private readonly IClientRepository _clientRepository;

        //------------------------------------------------------------------------------------------//
        public CreateClientCommandHandler(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<CreateClientResponseDto> Handle(CreateClientCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var names = request.RequestDto.FullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                var firstName = names.Length > 0 ? names[0] : "";
                var lastName = names.Length > 1 ? names[1] : "";

                var client = new Models.CRM.Client
                {
                    ClientId = Guid.NewGuid(),
                    FirstName = firstName,
                    LastName = lastName,
                    Email = request.RequestDto.Email,
                    Phone = request.RequestDto.Phone,
                    PhysicalAddress = request.RequestDto.PhysicalAddress,
                    CreatedAt = DateTime.UtcNow
                };

                await _clientRepository.AddAsync(client);

                return new CreateClientResponseDto 
                { 
                    Success = true, 
                    Message = "Client created successfully.", 
                    ClientId = client.ClientId 
                };
            }
            catch (Exception ex)
            {
                return new CreateClientResponseDto 
                { 
                    Success = false, 
                    Message = $"Error: {ex.Message}" 
                };
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
