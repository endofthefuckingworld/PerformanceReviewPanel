using System.ComponentModel.DataAnnotations;

namespace PerformerApi.DTOs
{
    public class DeclineApplicationDto
    {
        [Required]
        [StringLength(1000)]
        public required string Reason { get; set; }
    }
}
