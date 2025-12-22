using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryMap.Api.Migrations
{
    /// <inheritdoc />
    public partial class OsmSchemaUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OpeningHoursJson",
                table: "Libraries",
                newName: "OsmType");

            migrationBuilder.AlterColumn<string>(
                name: "Suburb",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Postcode",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "OpeningHoursRaw",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "OsmId",
                table: "Libraries",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OsmLastUpdated",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OpeningHoursRaw",
                table: "Libraries");

            migrationBuilder.DropColumn(
                name: "OsmId",
                table: "Libraries");

            migrationBuilder.DropColumn(
                name: "OsmLastUpdated",
                table: "Libraries");

            migrationBuilder.RenameColumn(
                name: "OsmType",
                table: "Libraries",
                newName: "OpeningHoursJson");

            migrationBuilder.AlterColumn<string>(
                name: "Suburb",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Postcode",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Libraries",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
