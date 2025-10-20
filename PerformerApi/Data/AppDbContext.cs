using Microsoft.EntityFrameworkCore;
using PerformerApi.Models;

namespace PerformerApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Performer> Performers { get; set; }
    public DbSet<Application> Applications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Performer>()
            .HasMany(p => p.Applications)
            .WithOne(a => a.Performer)
            .HasForeignKey(a => a.PerformerId);
    }
}
