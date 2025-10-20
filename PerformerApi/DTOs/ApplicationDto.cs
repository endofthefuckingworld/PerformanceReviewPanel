namespace PerformerApi.DTOs;

public class ApplicationDto
{
    public required int Id { get; set; }
    public required string PerformanceTitle { get; set; }
    public required DateTime ApplicationDate { get; set; }
    public required string Style { get; set; }
    public required decimal Fee { get; set; }
    public required int DurationMinutes { get; set; }
    public required string OwnEquipment { get; set; }
    public required int NumPerformers { get; set; }
    public required string RequiredEquipment { get; set; }
    public required decimal TravelAllowance { get; set; }
    public required string RequiredSpace { get; set; }
    public bool? IsApproved { get; set; }
    public string? DeclineReason { get; set; }
    public string? VideoUrl { get; set; }

    public PerformerDto Performer { get; set; }
}
