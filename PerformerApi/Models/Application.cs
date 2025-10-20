using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;



namespace PerformerApi.Models;

public class Application
{
    [Key]
    public required int Id { get; set; }

    [Required]
    public required int PerformerId { get; set; }  // FK

    [Required]
    [StringLength(1000)]
    public required string PerformanceTitle { get; set; }

    [Required]
    public required DateTime ApplicationDate { get; set; }

    [Required]
    [StringLength(1000)]
    public required string Style { get; set; }

    [Range(0, 100000000)]
    public decimal Fee { get; set; }

    [Range(1, 10080)]
    public int DurationMinutes { get; set; }

    [Required]
    [StringLength(1000)]
    public required string OwnEquipment { get; set; }

    [Range(1, 1000)]
    public int NumPerformers { get; set; }

    [Required]
    [StringLength(2000)]
    public required string RequiredEquipment { get; set; }

    [Range(0, 1000000)]
    public decimal TravelAllowance { get; set; }

    [Required]
    [StringLength(1000)]
    public required string RequiredSpace { get; set; }

    public bool? IsApproved { get; set; }

    [StringLength(50000)]
    public string? DeclineReason { get; set; }

    [AllowNull]
    [Url]
    public string? VideoUrl { get; set; }

    // 導覽屬性
    public Performer? Performer { get; set; } = null!;
}


