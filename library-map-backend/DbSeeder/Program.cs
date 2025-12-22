using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

// ★ Backend の Entity / DbContext を使う
using LibraryMap.Api.Data;
using LibraryMap.Api.Models;

// ======================================================
// パス設定
// ======================================================

// DbSeeder/bin/... から backend ルートへ戻る
string backendRoot = Path.GetFullPath(Path.Combine(
    AppContext.BaseDirectory,
    "..", "..", "..", ".."
));

// appsettings
string appsettingsPath = Path.Combine(
    backendRoot,
    "LibraryMap.Api", "appsettings.Development.json"
);

// seed file
string seedPath = Path.Combine(
    backendRoot,
    "LibraryMap.Api", "Data", "Seed", "seed-libraries.json"
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

Console.WriteLine($"Reading seed: {seedPath}");

var seedJson = await File.ReadAllTextAsync(seedPath);

var seedItems = JsonSerializer.Deserialize<List<SeedLibrary>>(seedJson, new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true
}) ?? new();

Console.WriteLine($"Seed items: {seedItems.Count}");

// ======================================================
// DbContext
// ======================================================

var options = new DbContextOptionsBuilder<LibraryContext>()
    .UseSqlServer(connectionString)
    .Options;

await using var db = new LibraryContext(options);

// Migration 管理前提（EnsureCreated は使わない）
await db.Database.MigrateAsync();

// 既存 OSM データ取得（Upsert 用）
var existing = await db.Libraries
    .Where(l => l.OsmType != null && l.OsmId != null)
    .ToListAsync();

var existingMap = existing.ToDictionary(
    l => $"{l.OsmType}/{l.OsmId}",
    StringComparer.OrdinalIgnoreCase
);

// ======================================================
// Seed → Entity 変換 & Insert（既存はOsmLastUpdatedだけ埋める）
// ======================================================

int inserted = 0;
int skipped = 0;
int updated = 0;

foreach (var seed in seedItems)
{
    // seed.OsmId = "node/903719806"
    var parts = seed.OsmId?.Split('/', 2);

    string? osmType = seed.OsmType ?? parts?.FirstOrDefault();
    long? osmId = null;

    if (parts?.Length == 2 && long.TryParse(parts[1], out var parsed))
    {
        osmId = parsed;
    }

    if (osmType == null || osmId == null)
    {
        skipped++;
        continue;
    }

    string key = $"{osmType}/{osmId}";

    // 既存なら Insert しない。ただし OsmLastUpdated が未設定なら埋める
    if (existingMap.TryGetValue(key, out var existingLib))
    {
        if (string.IsNullOrWhiteSpace(existingLib.OsmLastUpdated) &&
            !string.IsNullOrWhiteSpace(seed.OsmLastUpdated))
        {
            existingLib.OsmLastUpdated = seed.OsmLastUpdated;
            updated++;
        }

        skipped++;
        continue;
    }

    var library = new Library
    {
        OsmType = osmType,
        OsmId = osmId,
        OsmLastUpdated = seed.OsmLastUpdated,   // ★追加

        Name = seed.Name ?? "(no name)",
        Lat = seed.Lat,
        Lng = seed.Lon,

        Category = "library",
        WebsiteUrl = seed.Website,
        OpeningHoursRaw = seed.OpeningHours,

        // seed では埋まらない項目
        Address = null,
        Suburb = null,
        Postcode = null,
        HasParking = null,
        NearestBusStop = null,
        WalkingMinutesFromBus = null,
        GooglePlaceId = null
    };

    db.Libraries.Add(library);
    existingMap[key] = library;
    inserted++;
}

await db.SaveChangesAsync();

Console.WriteLine($"✅ Inserted: {inserted}");
Console.WriteLine($"✍ Updated : {updated} (filled OsmLastUpdated)");
Console.WriteLine($"⏭ Skipped : {skipped}");

// ======================================================
// Seed DTO（入力専用）
// ======================================================

public sealed class SeedLibrary
{
    public string? OsmType { get; set; }
    public string? OsmId { get; set; }        // "node/903719806"

    public string? Name { get; set; }
    public double Lat { get; set; }
    public double Lon { get; set; }

    public string? Website { get; set; }
    public string? OpeningHours { get; set; }
    public string? OsmLastUpdated { get; set; } //一年前の情報は非表示？
}
