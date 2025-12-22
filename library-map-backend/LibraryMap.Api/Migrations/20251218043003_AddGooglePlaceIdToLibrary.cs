using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryMap.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGooglePlaceIdToLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GooglePlaceId",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GooglePlaceId",
                table: "Libraries");
        }
    }
}
