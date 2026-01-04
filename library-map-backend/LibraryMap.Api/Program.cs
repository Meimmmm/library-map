using Microsoft.EntityFrameworkCore;
using LibraryMap.Api.Data;
using LibraryMap.Api.Data.Seed;

var builder = WebApplication.CreateBuilder(args);

//******************************************************************
// Services
//******************************************************************
builder.Services.AddEndpointsApiExplorer(); // For Swagger
builder.Services.AddSwaggerGen();           // For Swagger
builder.Services.AddControllers();

//DB
builder.Services.AddDbContext<LibraryContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("LibraryDb")));
    // options.UseSqlServer(builder.Configuration.GetConnectionString("LibraryDb")));

// CORS
const string CorsPolicyName = "FrontendDev";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",    // Can come from this URL. ※Port number is for Vite dev server
                "https://gray-mud-0fd63cf00.1.azurestaticapps.net"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();  // Allow any HTTP method (GET, POST, etc.)
    });
});

var app = builder.Build();

//******************************************************************
// DB migrate + seed
//******************************************************************
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LibraryContext>();
    await db.Database.MigrateAsync();                    // Table creation/update
    await LibrarySeeder.SeedAsync(db, app.Environment);  // Initial data input
}

//******************************************************************
// Middleware pipeline
//******************************************************************
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//Important: The order of Routing → CORS → Controllers is stable.
app.UseRouting();

app.UseCors(CorsPolicyName);

app.MapControllers();

//optional
app.MapGet("/debug/db", (LibraryContext db) =>
{
    return new
    {
        Database = db.Database.GetDbConnection().Database,
        DataSource = db.Database.GetDbConnection().DataSource
    };
});

app.Run();

