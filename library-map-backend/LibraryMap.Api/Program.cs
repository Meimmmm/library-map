using Microsoft.EntityFrameworkCore;
using LibraryMap.Api.Data;
using LibraryMap.Api.Data.Seed;

var builder = WebApplication.CreateBuilder(args);

//******************************************************************
// Add services to the container.
//******************************************************************
builder.Services.AddOpenApi();              
builder.Services.AddEndpointsApiExplorer(); // For Swagger
builder.Services.AddSwaggerGen();           // For Swagger
builder.Services.AddControllers();

builder.Services.AddDbContext<LibraryContext>(options =>
    // options.UseSqlServer(builder.Configuration.GetConnectionString("LibraryDb")));
    options.UseSqlite(builder.Configuration.GetConnectionString("LibraryDb")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173") // Can come from this URL. ※Port number is for Vite dev server
            .AllowAnyHeader()
            .AllowAnyMethod();  // Allow any HTTP method (GET, POST, etc.)
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LibraryContext>();
    await db.Database.MigrateAsync();          // テーブル作成/更新
    await LibrarySeeder.SeedAsync(db, app.Environment);  // 初回データ投入
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // app.MapOpenApi(); // Just output OpenAPI JSON (no UI) 
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();
app.UseCors("FrontendDev"); // Use CORS policy  ???????★

// var summaries = new[]
// {
//     "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
// };

app.MapGet("/debug/db", (LibraryContext db) =>
{
    return new
    {
        Database = db.Database.GetDbConnection().Database,
        DataSource = db.Database.GetDbConnection().DataSource
    };
});


// app.MapGet("/weatherforecast", () =>
// {
//     var forecast =  Enumerable.Range(1, 5).Select(index =>
//         new WeatherForecast
//         (
//             DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
//             Random.Shared.Next(-20, 55),
//             summaries[Random.Shared.Next(summaries.Length)]
//         ))
//         .ToArray();
//     return forecast;
// })
// .WithName("GetWeatherForecast");


app.MapControllers();
app.Run();

// record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
// {
//     public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
// }
