using MediatR;
using Inflame_Backend.Features.CustomBuild.DTOs;
using System;

namespace Inflame_Backend.Features.CustomBuild.Commands
{
    public class CreateCustomBuildCommand : IRequest<Guid>
    {
        public CustomBuildRequestDto RequestData { get; set; }

        public CreateCustomBuildCommand(CustomBuildRequestDto requestData)
        {
            RequestData = requestData;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
