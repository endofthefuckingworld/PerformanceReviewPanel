using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PerformerApi.Data;
using PerformerApi.Models;

namespace PerformerApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PerformersController : ControllerBase
{
    private readonly AppDbContext _context;

    public PerformersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/performers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Performer>>> GetPerformers()
    {
        return await _context.Performers.ToListAsync();
    }

    // GET: api/performers/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Performer>> GetPerformer(int id)
    {
        var performer = await _context.Performers.FindAsync(id);
        if (performer == null)
            return NotFound();
        return performer;
    }

    // POST: api/performers
    [HttpPost]
    public async Task<ActionResult<Performer>> CreatePerformer(Performer performer)
    {
        _context.Performers.Add(performer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPerformer), new { id = performer.Id }, performer);
    }
}