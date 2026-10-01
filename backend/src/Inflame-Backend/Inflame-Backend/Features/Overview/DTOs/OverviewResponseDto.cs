using Inflame_Backend.Models.CRM;
using System.Collections.Generic;

namespace Inflame_Backend.Features.Overview.DTOs
{
    public class OverviewResponseDto
    {
        public LeadPipelineMetricsDto LeadPipeline { get; set; } = new LeadPipelineMetricsDto();
        public CatalogueStatusMetricsDto CatalogueStatus { get; set; } = new CatalogueStatusMetricsDto();
        public IEnumerable<Enquiry> RecentQuoteRequests { get; set; } = new List<Enquiry>();
        
        // This will only be populated if the user is an Admin/SuperAdmin
        public SystemHealthMetricsDto? SystemHealth { get; set; }
    }

    public class LeadPipelineMetricsDto
    {
        public int New { get; set; }
        public int Contacted { get; set; }
        public int Converted { get; set; }
        public int Dead { get; set; }
        public double ConversionRate { get; set; }
    }

    public class CatalogueStatusMetricsDto
    {
        public int TotalBraais { get; set; }
        public int TotalFireplaces { get; set; }
    }

    public class SystemHealthMetricsDto
    {
        public string ApiConnection { get; set; } = "Operational";
        public string Database { get; set; } = "Stable";
        public string RedisCache { get; set; } = "Operational";
        public string StorageService { get; set; } = "Stable";
    }
}
//---------------------END OF FILE------------------------------------------------------------------//
