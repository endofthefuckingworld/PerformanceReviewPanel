namespace PerformerApi.DTOs;

public class PerformerDto
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public required string PhotoUrl { get; set; }
    public required string Introduction { get; set; }
}