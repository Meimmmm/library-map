namespace LibraryMap.Api.Models
{
    public class Library
    {
        public int Id { get; set; }
        public string? OsmType { get; set; }      // "node" / "way" / "relation"
        public string? OsmId { get; set; }          //way/663054311
        public double Lat { get; set; }
        public double Lon { get; set; }
        public string GooglePlaceId { get; set; } = null!;
        public string? Categories { get; set; }
        public string? Comment { get; set; }


        public string Name { get; set; } = null!;
        public string? Address { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? WebsiteUrl2 { get; set; }
        public string? OpeningHoursJson { get; set; }

    }

}
