using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using LibraryMap.Api.Data;
using LibraryMap.Api.Models;

// ======================================================
// パス設定
// ======================================================

string backendRoot = Path.GetFullPath(Path.Combine(
    AppContext.BaseDirectory, "..", "..", "..", ".."
));

string appsettingsPath = Path.Combine(
    backendRoot, "LibraryMap.Api", "appsettings.Development.json"
);

string seedPath = Path.Combine(
    backendRoot, "LibraryMap.Api", "Data", "Seed", "seed-libraries.json"
);

// ======================================================
// appsettings から接続文字列を取得
// ======================================================

if (!File.Exists(appsettingsPath))
{
    Console.Error.WriteLine($"❌ appsettings not found: {appsettingsPath}");
    return;
}

var config = new ConfigurationBuilder()
    .AddJsonFile(appsettingsPath, optional: false)
    .Build();

string? connectionString = config.GetConnectionString("LibraryDb");

if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.Error.WriteLine("❌ ConnectionStrings:LibraryDb not found");
    return;
}

// ======================================================
// seed 読み込み
// ======================================================

if (!File.Exists(seedPath))
{
    Console.Error.WriteLine($"❌ Seed file not found: {seedPath}");
    return;
}

Console.WriteLine($"📖 Reading seed: {seedPath}");

var seedJson = await File.ReadAllTextAsync(seedPath);

var jsonOptions = new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true,
    ReadCommentHandling = JsonCommentHandling.Skip,
    AllowTrailingCommas = true,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
};

var seedItems = JsonSerializer.Deserialize<List<SeedLibrary>>(seedJson, jsonOptions) ?? new();
Console.WriteLine($"📦 Seed items: {seedItems.Count}");

// ======================================================
// DbContext
// ======================================================

var dbOptions = new DbContextOptionsBuilder<LibraryContext>()
    .UseSqlServer(connectionString)
    .Options;

await using var db = new LibraryContext(dbOptions);

await db.Database.MigrateAsync();

// ======================================================
// Insert（全入れ）
// ======================================================

int inserted = 0;

foreach (var seed in seedItems)
{
    // ✅ exceptions なども含め、OpeningHours の元JSONをそのまま保存
    string? openingHoursJson = null;
    if (seed.OpeningHours.HasValue)
    {
        // GetRawText() は元の JSON テキストを保持（exceptions も残る）
        openingHoursJson = seed.OpeningHours.Value.GetRawText();
    }

    var library = new Library
    {
        // ✅ Id は書かない：DBが自動採番（IDENTITY）
        OsmType = Normalize(seed.OsmType),
        OsmId = Normalize(seed.OsmId),

        Lat = seed.Lat,
        Lon = seed.Lon,

        GooglePlaceId = seed.GooglePlaceId ?? "",
        Categories = Normalize(seed.Categories),
        Comment = Normalize(seed.Comment),

        Name = string.IsNullOrWhiteSpace(seed.Name) ? "(no name)" : seed.Name.Trim(),
        Address = Normalize(seed.Address),

        WebsiteUrl = Normalize(seed.Website),
        WebsiteUrl2 = Normalize(seed.Website2),

        OpeningHoursJson = openingHoursJson,

        HasParking = null,
        NearestBusStop = null,
        WalkingMinutesFromBus = null,
    };

    db.Libraries.Add(library);
    inserted++;
}

await db.SaveChangesAsync();

Console.WriteLine($"✅ Inserted: {inserted}");

// ======================================================
// helpers
// ======================================================

static string? Normalize(string? s)
{
    if (string.IsNullOrWhiteSpace(s)) return null;
    return s.Trim();
}

// ======================================================
// Seed DTO（入力専用）※Data Transfer Object
// ======================================================

public sealed class SeedLibrary
{
    public string? OsmType { get; set; }
    public string? OsmId { get; set; }          // "way/182633531"

    public string? Name { get; set; }
    public string? Address { get; set; }

    public double Lat { get; set; }
    public double Lon { get; set; }

    public string? Website { get; set; }        // seed の "Website"
    public string? Website2 { get; set; }       // seed の "Website2"

    public string? GooglePlaceId { get; set; }
    public string? Categories { get; set; }
    public string? Comment { get; set; }

    // ✅ 型を固定しない：exceptions 等も含めて丸ごと保持できる
    public JsonElement? OpeningHours { get; set; }
}
