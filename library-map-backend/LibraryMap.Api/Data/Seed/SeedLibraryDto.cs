using System.Text.Json;

namespace LibraryMap.Api.Data.Seed;

public class SeedLibraryDto
{
    // JSONにあるもの
    public string OsmId { get; set; } = "";
    public string OsmType { get; set; } = "";    
    public double Lat { get; set; }
    public double Lon { get; set; } 
    public string GooglePlaceId { get; set; } = "";
    public string? Categories { get; set; }
    public string? Comment { get; set; }


    public string Name { get; set; } = "";

    public string? Address { get; set; }
    public string? Website { get; set; }
    public string? Website2 { get; set; }
    public JsonElement? OpeningHours { get; set; }

}
