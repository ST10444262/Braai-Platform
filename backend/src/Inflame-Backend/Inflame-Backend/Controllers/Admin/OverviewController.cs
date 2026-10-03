using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Inflame_Backend.Features.Overview.Queries;
using Inflame_Backend.Features.Overview.DTOs;
using System.Threading.Tasks;

namespace Inflame_Backend.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/overview")]
    [Authorize(Roles = "SuperAdmin,Admin,Employee")]
    public class OverviewController : ControllerBase
    {
        private readonly IMediator _mediator;

        //------------------------------------------------------------------------------------------//
        public OverviewController(IMediator mediator)
        {
            _mediator = mediator;
        }

        //------------------------------------------------------------------------------------------//
        /// <summary>
        /// Retrieves the aggregated dashboard overview metrics. 
        /// System Health is only included if the user has Admin or SuperAdmin privileges.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<OverviewResponseDto>> GetOverview()
        {
            // Determine if the user has elevated privileges to see System Health
            bool isAdmin = User.IsInRole("SuperAdmin") || User.IsInRole("Admin");

            var query = new GetOverviewQuery
            {
                IncludeSystemHealth = isAdmin
            };

            var result = await _mediator.Send(query);

            return Ok(result);
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//