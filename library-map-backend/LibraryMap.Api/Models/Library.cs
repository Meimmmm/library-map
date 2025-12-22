namespace LibraryMap.Api.Models
{
    public class Library
    {
        public int Id { get; set; }

        // 出典・一意キー（OSM）
        public string? OsmType { get; set; }      // "node" / "way" / "relation"
        public long? OsmId { get; set; }          // 57919090
        public string? OsmLastUpdated { get; set; } // あれば（ISO文字列でもOK）

        public string Name { get; set; } = null!;
        public double Lat { get; set; }
        public double Lng { get; set; }

        // まずは “原文” を保存（OSM opening_hours そのまま）
        public string? OpeningHoursRaw { get; set; }

        // 住所系は必ず欠けるので optional
        public string? Address { get; set; }
        public string? Suburb { get; set; }
        public string? Postcode { get; set; }

        // 将来拡張のため optional
        public string? Category { get; set; }     // "library" など
        public string? WebsiteUrl { get; set; }

        public bool? HasParking { get; set; }
        public string? NearestBusStop { get; set; }
        public int? WalkingMinutesFromBus { get; set; }

        // Googleは後で入るかも、なので optionalのまま
        public string? GooglePlaceId { get; set; }
    }

}
