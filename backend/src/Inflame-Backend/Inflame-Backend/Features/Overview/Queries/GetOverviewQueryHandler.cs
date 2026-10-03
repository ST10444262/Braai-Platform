using MediatR;
using Inflame_Backend.Features.Overview.DTOs;
using Inflame_Backend.Data.Repositories.CRM;
using Inflame_Backend.Data.Repositories.ProductCatalog;
using Inflame_Backend.Data.Instances;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace Inflame_Backend.Features.Overview.Queries
{
    public class GetOverviewQueryHandler : IRequestHandler<GetOverviewQuery, OverviewResponseDto>
    {
        private readonly IEnquiryRepository _enquiryRepository;
        private readonly IBraaiProductRepository _braaiRepository;
        private readonly IFireplaceProductRepository _fireplaceRepository;
        private readonly RedisInstance _redisInstance;
        private readonly SupabaseInstance _supabaseInstance;

        //------------------------------------------------------------------------------------------//
        public GetOverviewQueryHandler(
            IEnquiryRepository enquiryRepository,
            IBraaiProductRepository braaiRepository,
            IFireplaceProductRepository fireplaceRepository,
            RedisInstance redisInstance,
            SupabaseInstance supabaseInstance)
        {
            _enquiryRepository = enquiryRepository;
            _braaiRepository = braaiRepository;
            _fireplaceRepository = fireplaceRepository;
            _redisInstance = redisInstance;
            _supabaseInstance = supabaseInstance;
        }

        //------------------------------------------------------------------------------------------//
        public async Task<OverviewResponseDto> Handle(GetOverviewQuery request, CancellationToken cancellationToken)
        {
            var response = new OverviewResponseDto();

            // Lead Pipeline Metrics
            var allEnquiries = await _enquiryRepository.GetAllAsync();
            var totalEnquiries = allEnquiries.Count();

            response.LeadPipeline.New = allEnquiries.Count(e => e.Status == "New");
            response.LeadPipeline.Contacted = allEnquiries.Count(e => e.Status == "Contacted");
            response.LeadPipeline.Converted = allEnquiries.Count(e => e.Status == "Converted");
            response.LeadPipeline.Dead = allEnquiries.Count(e => e.Status == "Dead");

            if (totalEnquiries > 0)
            {
                response.LeadPipeline.ConversionRate = System.Math.Round((double)response.LeadPipeline.Converted / totalEnquiries * 100, 1);
            }

            // Catalogue Status Metrics
            var braais = await _braaiRepository.GetAllAsync();
            var fireplaces = await _fireplaceRepository.GetAllAsync();

            response.CatalogueStatus.TotalBraais = braais.Count();
            response.CatalogueStatus.TotalFireplaces = fireplaces.Count();

            // Recent Quote Requests (5 most recent)
            response.RecentQuoteRequests = allEnquiries
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .ToList();

            // System Health Metrics (Admin Only)
            if (request.IncludeSystemHealth)
            {
                var redisStatus = _redisInstance.Connection.IsConnected ? "Operational" : "Degraded";
                
                var storageStatus = "Stable";
                try
                {
                    await _supabaseInstance.Client.Storage.ListBuckets();
                }
                catch
                {
                    storageStatus = "Degraded";
                }

                response.SystemHealth = new SystemHealthMetricsDto
                {
                    ApiConnection = "Operational",
                    Database = "Stable", // Safe to assume since GetAllAsync() above succeeded
                    RedisCache = redisStatus,
                    StorageService = storageStatus
                };
            }

            return response;
        }
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
