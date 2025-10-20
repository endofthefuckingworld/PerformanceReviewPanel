using Microsoft.EntityFrameworkCore;
using PerformerApi.Data;

var builder = WebApplication.CreateBuilder(args);

var connStr = Environment.GetEnvironmentVariable("DATABASE_URL")
              ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(connStr, npgsql =>
    {
        npgsql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
    }));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 可在開發/生產皆啟用 Swagger（方便 demo）
app.UseSwagger();
app.UseSwaggerUI();

// 啟動時自動套用 migration（會建立缺少的 table）
//using (var scope = app.Services.CreateScope())
//{
    //var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    //db.Database.Migrate();
//}

app.UseHttpsRedirection();
app.MapControllers();
app.Run();
