using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;

const string inputPath = "GeoJSON_Adelaide.geojson";
const string outputPath = "seed-libraries.json";

if (!File.Exists(inputPath))
{
    Console.Error.WriteLine($"Input file not found: {Path.GetFullPath(inputPath)}");
    Environment.Exit(1);
}

var json = await File.ReadAllTextAsync(inputPath);

var geo = JsonSerializer.Deserialize<GeoJsonFeatureCollection>(json, JsonOpts.Read)
          ?? throw new Exception("Failed to parse GeoJSON.");

var seed = geo.Features
    .Where(f => f.Geometry?.Type == "Point" && f.Geometry.Coordinates is { Length: >= 2 })
    .Select(f =>
    {
        var props = f.Properties ?? new Dictionary<string, JsonElement>();

        string? GetString(string key)
            => props.TryGetValue(key, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;

        // OSM id is usually in "@id" like "node/57919090"
        var osmIdRaw = GetString("@id") ?? GetString("id");
        if (string.IsNullOrWhiteSpace(osmIdRaw)) return null;

        var parts = osmIdRaw.Split('/', 2, StringSplitOptions.RemoveEmptyEntries);
        var osmType = parts.Length == 2 ? parts[0] : null;
        var osmRef = parts.Length == 2 ? parts[1] : null;

        var lon = f.Geometry!.Coordinates![0];
        var lat = f.Geometry!.Coordinates![1];

        return new SeedLibrary
        {
            OsmType = osmType ?? "unknown",
            OsmId = $"{(osmType ?? "unknown")}/{(osmRef ?? osmIdRaw)}",
            Name = GetString("name") ?? "(no name)",
            Lat = lat,
            Lon = lon,
            Website = GetString("website") ?? GetString("contact:website"),
            OpeningHours = GetString("opening_hours")
        };
    })
    .Where(x => x is not null)
    .Cast<SeedLibrary>()
    // 重複排除（同じ osmId が複数来たら最初を採用）
    .GroupBy(x => x.OsmId)
    .Select(g => g.First())
    .OrderBy(x => x.Name)
    .ToList();

var outJson = JsonSerializer.Serialize(seed, JsonOpts.Write);

await File.WriteAllTextAsync(outputPath, outJson);

Console.WriteLine($"✅ Created {outputPath}");
Console.WriteLine($"   Count: {seed.Count}");
Console.WriteLine($"   Path : {Path.GetFullPath(outputPath)}");


// ---------- Models ----------
public sealed class SeedLibrary
{
    public string OsmType { get; set; } = default!;
    public string OsmId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public double Lat { get; set; }
    public double Lon { get; set; }
    public string? Website { get; set; }
    public string? OpeningHours { get; set; }
}

public sealed class GeoJsonFeatureCollection
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("features")]
    public List<GeoJsonFeature> Features { get; set; } = new();
}

public sealed class GeoJsonFeature
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("geometry")]
    public GeoJsonGeometry? Geometry { get; set; }

    [JsonPropertyName("properties")]
    public Dictionary<string, JsonElement>? Properties { get; set; }
}

public sealed class GeoJsonGeometry
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("coordinates")]
    public double[]? Coordinates { get; set; }
}

public static class JsonOpts
{
    public static readonly JsonSerializerOptions Read = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static readonly JsonSerializerOptions Write = new()
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };
}
