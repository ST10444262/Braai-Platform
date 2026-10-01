using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Features.Client.DTOs;
using Inflame_Backend.Models.CRM;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Inflame_Backend.Features.Client.Commands
{
    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Command to add an internal note to a client.
    /// </summary>
    public record AddClientNoteCommand(Guid ClientId, AddClientNoteRequestDto RequestDto) : IRequest<AddClientNoteResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles adding an internal note to a client profile.
    /// </summary>
    public class AddClientNoteCommandHandler : IRequestHandler<AddClientNoteCommand, AddClientNoteResponseDto>
    {
        private readonly IInternalNoteRepository _internalNoteRepository;
        private readonly IClientRepository _clientRepository;

        //------------------------------------------------------------------------------------------//
        public AddClientNoteCommandHandler(IInternalNoteRepository internalNoteRepository, IClientRepository clientRepository)
        {
            _internalNoteRepository = internalNoteRepository;
            _clientRepository = clientRepository;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<AddClientNoteResponseDto> Handle(AddClientNoteCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var client = await _clientRepository.GetByIdAsync(request.ClientId);
                if (client == null)
                {
                    return new AddClientNoteResponseDto { Success = false, Message = "Client not found." };
                }

                if (string.IsNullOrWhiteSpace(request.RequestDto.Content))
                {
                    return new AddClientNoteResponseDto { Success = false, Message = "Note content cannot be empty." };
                }

                var internalNote = new InternalNote
                {
                    NoteId = Guid.NewGuid(),
                    ClientId = request.ClientId,
                    StaffAccountId = request.RequestDto.StaffAccountId,
                    Content = request.RequestDto.Content,
                    CreatedAt = DateTime.UtcNow
                };

                await _internalNoteRepository.AddAsync(internalNote);

                return new AddClientNoteResponseDto
                {
                    Success = true,
                    Message = "Internal note added successfully.",
                    NoteId = internalNote.NoteId
                };
            }
            catch (Exception ex)
            {
                return new AddClientNoteResponseDto { Success = false, Message = $"Error: {ex.Message}" };
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
