using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using LibraryMap.Api.Models;

namespace LibraryMap.Api.Data.Seed;

public static class LibrarySeeder
{
    public static async Task SeedAsync(LibraryContext db, IHostEnvironment env)
    {
        // 初回のみ
        if (await db.Libraries.AnyAsync()) return;

        var path = Path.Combine(
            env.ContentRootPath,
            "Data",
            "Seed",
            "seed-libraries.json" // ← 実ファイル名と一致させる
        );

        var json = await File.ReadAllTextAsync(path);

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            AllowTrailingCommas = true // 念のため
        };

        var seed = JsonSerializer.Deserialize<List<SeedLibraryDto>>(json, options) ?? new();

        var entities = seed.Select(s => new Library
        {
            OsmType = s.OsmType,
            OsmId = s.OsmId,
            Lat = s.Lat,
            Lon = s.Lon,
            GooglePlaceId = s.GooglePlaceId,
            Categories = s.Categories,
            Comment = s.Comment,

            Name = s.Name,
            Address = s.Address,
            WebsiteUrl = s.Website,
            WebsiteUrl2 = s.Website2,
            OpeningHoursJson = s.OpeningHours is null
                ? null
                : s.OpeningHours.Value.GetRawText()
        });

        db.Libraries.AddRange(entities);
        await db.SaveChangesAsync();
    }
}
