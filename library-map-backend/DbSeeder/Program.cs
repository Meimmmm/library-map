using System.Text.Json;
using System.Text.Json.Serialization;
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

var jsonOptions = new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true,
    ReadCommentHandling = JsonCommentHandling.Skip,
    AllowTrailingCommas = true,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
};

var seedItems = JsonSerializer.Deserialize<List<SeedLibrary>>(seedJson, jsonOptions) ?? new();

Console.WriteLine($"Seed items: {seedItems.Count}");

// ======================================================
// DbContext
// ======================================================

Console.WriteLine($"[Seeder] conn = {connectionString}");

var options = new DbContextOptionsBuilder<LibraryContext>()
    .UseSqlServer(connectionString)
    .Options;

await using var db = new LibraryContext(options);

Console.WriteLine($"[Seeder] DB = {db.Database.GetDbConnection().Database}");

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

    // ★ OpeningHours(object) を DB には string(JSON) として保存する
    string? openingHoursJson = null;
    if (seed.OpeningHours is not null)
    {
        // exceptions を今は使わなくても、入ってきたらそのまま含めて文字列化される
        openingHoursJson = JsonSerializer.Serialize(seed.OpeningHours, jsonOptions);
    }

    var library = new Library
    {
        OsmType = osmType,
        OsmId = osmId,
        OsmLastUpdated = seed.OsmLastUpdated,

        Name = seed.Name ?? "(no name)",
        Lat = seed.Lat,
        Lng = seed.Lon,

        WebsiteUrl = seed.Website,
        OpeningHoursJson = openingHoursJson,

        // seed では埋まらない項目
        Address = null,
        HasParking = null,
        NearestBusStop = null,
        WalkingMinutesFromBus = null,
        GooglePlaceId = seed.GooglePlaceId // ← seedに入れるなら反映（無ければnull）
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
    public string? GooglePlaceId { get; set; } // ★追加（seedにあるなら）

    // ★ここが変更：string ではなく object(DTO)
    public OpeningHoursPayload? OpeningHours { get; set; }

    public string? OsmLastUpdated { get; set; }
}

// 自前 canonical opening hours（exceptions は今は実装しない前提）
public sealed class OpeningHoursPayload
{
    public string timezone { get; set; } = "Australia/Adelaide";
    public WeeklyPayload weekly { get; set; } = new();
    public SourcePayload source { get; set; } = new();

    // exceptions は今は使わないなら不要（入ってくる可能性があるならコメント解除）
    // public List<ExceptionPayload>? exceptions { get; set; }
}

public sealed class WeeklyPayload
{
    public List<TimeRangePayload> mon { get; set; } = new();
    public List<TimeRangePayload> tue { get; set; } = new();
    public List<TimeRangePayload> wed { get; set; } = new();
    public List<TimeRangePayload> thu { get; set; } = new();
    public List<TimeRangePayload> fri { get; set; } = new();
    public List<TimeRangePayload> sat { get; set; } = new();
    public List<TimeRangePayload> sun { get; set; } = new();
}

public sealed class TimeRangePayload
{
    public string open { get; set; } = default!;
    public string close { get; set; } = default!;
}

public sealed class SourcePayload
{
    public string type { get; set; } = "manual";
    public string updatedAt { get; set; } = default!;
}
