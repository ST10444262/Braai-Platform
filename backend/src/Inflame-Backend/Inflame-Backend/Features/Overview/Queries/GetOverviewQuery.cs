using MediatR;
using Inflame_Backend.Features.Overview.DTOs;

namespace Inflame_Backend.Features.Overview.Queries
{
    public class GetOverviewQuery : IRequest<OverviewResponseDto>
    {
        // To conditionally retrieve System Health metrics
        public bool IncludeSystemHealth { get; set; }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
