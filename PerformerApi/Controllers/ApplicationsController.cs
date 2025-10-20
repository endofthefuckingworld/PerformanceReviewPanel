using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PerformerApi.Data;
using PerformerApi.Models;
using PerformerApi.DTOs;

namespace PerformerApi.Controllers;
[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ApplicationsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 取得申請清單（分頁 + 排序 + 狀態過濾 + 濾除特定表演者）
    /// GET /api/applications?page=1&sortBy=applicationDate&sortDir=desc&
    /// sortBy: approvalStatus | applicationDate | category | performanceName
    /// status: pending | reviewed | approved | rejected （可複選）
    /// </summary>
    [HttpGet("page")]
    public async Task<IActionResult> GetApplicationsPage(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? performerName = null,
        [FromQuery] bool? isApproved = null,
        [FromQuery] bool? isChecked = null,
        [FromQuery] string? sortBy = null,                       // approvalStatus | applicationDate | category | performanceTitle
        [FromQuery] string? sortDir = "desc"                     // asc | desc
    )
    {
        if (page <= 0 || pageSize <= 0)
            return BadRequest("page 和 pageSize 必須是正整數");

        // 一頁最多 20 筆
        pageSize = Math.Min(pageSize, 20);

        var query = _context.Applications
            .Include(a => a.Performer)
            .AsNoTracking()
            .AsQueryable();

        // 文字搜尋：表演者名稱
        if (!string.IsNullOrWhiteSpace(performerName))
        {
            query = query.Where(a => a.Performer != null && a.Performer.Name.Contains(performerName));
        }

    
        if (isApproved.HasValue)
        {
            query = query.Where(a => a.IsApproved == isApproved);
        }
        else if (isChecked.HasValue)
        {
            if (isChecked == true)
                query = query.Where(a => a.IsApproved != null);
            else
                query = query.Where(a => a.IsApproved == null);
        }

        // 排序
        bool desc = string.Equals(sortDir, "desc", StringComparison.OrdinalIgnoreCase);
        IOrderedQueryable<Application> ordered = sortBy?.ToLowerInvariant() switch
        {
            "approvalstatus" => desc
                ? query.OrderByDescending(a => a.IsApproved == null ? -1 : (a.IsApproved == true ? 1 : 0)).ThenBy(a => a.Id)
                : query.OrderBy(a => a.IsApproved == null ? -1 : (a.IsApproved == true ? 1 : 0)).ThenBy(a => a.Id),

            "checkstatus" => desc
                ? query.OrderByDescending(a => a.IsApproved == null ? -1 : (a.IsApproved == true ? 1 : 0)).ThenBy(a => a.Id)
                : query.OrderBy(a => a.IsApproved == null ? -1 : (a.IsApproved == true ? 1 : 0)).ThenBy(a => a.Id),

            "applicationdate" => desc
                ? query.OrderByDescending(a => a.ApplicationDate).ThenBy(a => a.Id)
                : query.OrderBy(a => a.ApplicationDate).ThenBy(a => a.Id),

            "category" => desc
                ? query.OrderByDescending(a => a.Performer!.Category).ThenBy(a => a.Id)
                : query.OrderBy(a => a.Performer!.Category).ThenBy(a => a.Id),

            "performancetitle" => desc
                ? query.OrderByDescending(a => a.PerformanceTitle).ThenBy(a => a.Id)
                : query.OrderBy(a => a.PerformanceTitle).ThenBy(a => a.Id),

            _ => query.OrderByDescending(a => a.ApplicationDate).ThenBy(a => a.Id) // 預設：申請日期新→舊
        };

        var totalCount = await ordered.CountAsync();

        var applications = await ordered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = applications.Select(a => new ApplicationDto
        {
            Id = a.Id,
            PerformanceTitle = a.PerformanceTitle,
            ApplicationDate = a.ApplicationDate,
            Style = a.Style,
            Fee = a.Fee,
            DurationMinutes = a.DurationMinutes,
            OwnEquipment = a.OwnEquipment,
            NumPerformers = a.NumPerformers,
            RequiredEquipment = a.RequiredEquipment,
            TravelAllowance = a.TravelAllowance,
            RequiredSpace = a.RequiredSpace,
            IsApproved = a.IsApproved,
            DeclineReason = a.DeclineReason,
            VideoUrl = a.VideoUrl,
            Performer = new PerformerDto
            {
                Id = a.Performer!.Id,
                Name = a.Performer!.Name,
                Category = a.Performer!.Category,
                PhotoUrl = a.Performer!.PhotoUrl,
                Introduction = a.Performer!.Introduction
            }
        });

        return Ok(new
        {
            totalCount,
            page,
            pageSize,
            data = result
        });
    }


    
    //所有資料（不過濾）	/api/applications
    //只查核准的	/api/applications?isApproved=true
    //只查未核准的	/api/applications?isApproved=false
    //只查「已審核」   /api/applications?isChecked=true
    //只查「未審核」   /api/applications?isChecked=false
    //查 Terry 申請且已審核的	/api/applications?performerName=Terry&isChecked=true
    //查 Terry 申請且通過的	/api/applications?performerName=Terry&isApproved=true
    [HttpGet]
    public async Task<IActionResult> GetApplications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? performerName = null,
        [FromQuery] bool? isApproved = null,
        [FromQuery] bool? isChecked = null)
    {
        if (page <= 0 || pageSize <= 0)
            return BadRequest("page 和 pageSize 必須是正整數");

        var query = _context.Applications
            .Include(a => a.Performer)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(performerName))
        {
            query = query.Where(a => a.Performer != null && a.Performer.Name.Contains(performerName));
        }

        if (isApproved.HasValue)
        {
            query = query.Where(a => a.IsApproved == isApproved);
        }
        else if (isChecked.HasValue)
        {
            if(isChecked == true)
                query = query.Where(a => a.IsApproved != null);
            else if(isChecked == false)
                query = query.Where(a => a.IsApproved == null);
        }

        var totalCount = await query.CountAsync();

        var applications = await query
            .OrderBy(a => a.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = applications.Select(a => new ApplicationDto
        {
            Id = a.Id,
            PerformanceTitle = a.PerformanceTitle,
            ApplicationDate = a.ApplicationDate,
            Style = a.Style,
            Fee = a.Fee,
            DurationMinutes = a.DurationMinutes,
            OwnEquipment = a.OwnEquipment,
            NumPerformers = a.NumPerformers,
            RequiredEquipment = a.RequiredEquipment,
            TravelAllowance = a.TravelAllowance,
            RequiredSpace = a.RequiredSpace,
            IsApproved = a.IsApproved,
            DeclineReason = a.DeclineReason,
            VideoUrl = a.VideoUrl,
            Performer = new PerformerDto
            {
                Id = a.Performer.Id,
                Name = a.Performer.Name,
                Category = a.Performer.Category,
                PhotoUrl = a.Performer.PhotoUrl,
                Introduction = a.Performer.Introduction
            }
        });

        return Ok(new {
            totalCount,
            page,
            pageSize,
            data = result
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApplicationDto>> GetApplication(int id)
    {
        var a = await _context.Applications
            .Include(a => a.Performer)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (a == null)
            return NotFound();

        var dto = new ApplicationDto
        {
            Id = a.Id,
            PerformanceTitle = a.PerformanceTitle,
            ApplicationDate = a.ApplicationDate,
            Style = a.Style,
            Fee = a.Fee,
            DurationMinutes = a.DurationMinutes,
            OwnEquipment = a.OwnEquipment,
            NumPerformers = a.NumPerformers,
            RequiredEquipment = a.RequiredEquipment,
            TravelAllowance = a.TravelAllowance,
            RequiredSpace = a.RequiredSpace,
            IsApproved = a.IsApproved,
            DeclineReason = a.DeclineReason,
            VideoUrl = a.VideoUrl,
            Performer = new PerformerDto
            {
                Id = a.Performer.Id,
                Name = a.Performer.Name,
                Category = a.Performer.Category,
                PhotoUrl = a.Performer.PhotoUrl,
                Introduction = a.Performer.Introduction
            }
        };

        return Ok(dto);
    }


    // POST: api/applications
    [HttpPost]
    public async Task<ActionResult<Application>> PostApplication(Application application)
    {
        try
        {
            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApplication), new { id = application.Id }, application);
        }
        catch (DbUpdateException ex)
        {
            // 外鍵錯誤或資料庫限制錯誤
            return BadRequest(new { message = "無法新增申請，請確認資料完整性。", detail = ex.InnerException?.Message ?? ex.Message });
        }
        catch (Exception ex)
        {
            // 其他錯誤
            return StatusCode(500, new { message = "伺服器錯誤，請稍後再試。", detail = ex.Message });
        }
    }

    private bool ApplicationExists(int id)
    {
        return _context.Applications.Any(a => a.Id == id);
    }

    // PUT: api/applications/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutApplication(int id, Application application)
    {
        if (id != application.Id)
        {
            return BadRequest("路由中的 id 與資料中的 id 不一致");
        }

        // 追蹤此物件的變更狀態
        _context.Entry(application).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // 資料可能被刪除了
            if (!ApplicationExists(id))
            {
                return NotFound($"找不到 id 為 {id} 的申請紀錄");
            }
            else
            {
                throw; // 其他錯誤就讓它拋出
            }
        }

        return NoContent();// 更新成功，無需回傳內容
    }

    // DELETE: api/applications/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteApplication(int id)
    {
        var application = await _context.Applications.FindAsync(id);

        if (application == null)
        {
            return NotFound($"找不到 id 為 {id} 的申請紀錄");
        }

        _context.Applications.Remove(application);
        await _context.SaveChangesAsync();

        return NoContent();  // 204，刪除成功無內容
    }

    // GET: api/performers/5/applications
    [HttpGet("performers/{id}/applications")]
    public async Task<ActionResult<IEnumerable<Application>>> GetApplicationsByPerformer(int id)
    {
        return await _context.Applications
            .Where(a => a.PerformerId == id)
            .ToListAsync();
    }

    // PATCH: api/applications/5/approve
    [HttpPatch("{id}/approve")]
    public async Task<IActionResult> ApproveApplication(int id)
    {
        var application = await _context.Applications.FindAsync(id);
        if (application == null)
            return NotFound();

        application.IsApproved = true;
        await _context.SaveChangesAsync();

        return Ok(application); // 或 NoContent();
    }

    // PATCH: api/applications/5/decline
    [HttpPatch("{id}/decline")]
    public async Task<IActionResult> DeclineApplication(int id, [FromBody] DeclineApplicationDto input)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var application = await _context.Applications.FindAsync(id);
        if (application == null)
            return NotFound();

        application.IsApproved = false;
        application.DeclineReason = input.Reason;

        await _context.SaveChangesAsync();

        return Ok(application);
    }
}
