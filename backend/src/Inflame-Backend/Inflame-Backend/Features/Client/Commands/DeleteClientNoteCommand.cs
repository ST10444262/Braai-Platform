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
    /// Command to delete an internal note.
    /// </summary>
    public record DeleteClientNoteCommand(Guid NoteId) : IRequest<DeleteClientNoteResponseDto>;

    //------------------------------------------------------------------------------------------//
    /// <summary>
    /// Handles the deletion of a client's internal note.
    /// </summary>
    public class DeleteClientNoteCommandHandler : IRequestHandler<DeleteClientNoteCommand, DeleteClientNoteResponseDto>
    {
        private readonly IInternalNoteRepository _internalNoteRepository;

        //------------------------------------------------------------------------------------------//
        public DeleteClientNoteCommandHandler(IInternalNoteRepository internalNoteRepository)
        {
            _internalNoteRepository = internalNoteRepository;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<DeleteClientNoteResponseDto> Handle(DeleteClientNoteCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var note = await _internalNoteRepository.GetByIdAsync(request.NoteId);
                if (note == null)
                {
                    return new DeleteClientNoteResponseDto { Success = false, Message = "Note not found." };
                }

                await _internalNoteRepository.DeleteAsync(note);

                return new DeleteClientNoteResponseDto { Success = true, Message = "Note deleted successfully." };
            }
            catch (Exception ex)
            {
                return new DeleteClientNoteResponseDto { Success = false, Message = $"Error: {ex.Message}" };
            }
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
