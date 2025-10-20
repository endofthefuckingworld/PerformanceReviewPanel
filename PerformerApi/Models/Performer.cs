using System.ComponentModel.DataAnnotations;

namespace PerformerApi.Models;

public class Performer
{
    [Key]
    public required int Id { get; set; }

    [Required]
    [StringLength(1000)]
    public required string Name { get; set; }

    [Required]
    [StringLength(1000)]
    public required string Category { get; set; }

    [Required]
    [Url]
    public required string PhotoUrl { get; set; }

    [Required]
    [StringLength(50000)]
    public required string Introduction { get; set; }

    public List<Application> Applications { get; set; } = new();
}



