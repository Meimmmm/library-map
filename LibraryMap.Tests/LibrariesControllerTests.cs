using LibraryMap.Api.Controllers;
using LibraryMap.Api.Data;
using LibraryMap.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryMap.Tests;

public class LibrariesControllerTests
{
    private LibraryContext GetDbContext()
    {
        //Testing by creating a temporary database in memory instead of using a real db
        var options = new DbContextOptionsBuilder<LibraryContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()) // InMemory Database: A db that exists only in memory
            .Options;

        return new LibraryContext(options);
    }

    private async Task SeedLibrariesAsync(LibraryContext testDb)
    {
        testDb.Libraries.AddRange(
            new Library { Id = 1, Name = "Adelaide City Library", GooglePlaceId = "test-google-place-id-1" },
            new Library { Id = 2, Name = "Burnside Library", GooglePlaceId = "test-google-place-id-2" }
        );

        await testDb.SaveChangesAsync();
    }

    [Fact]
    public async Task GetById_ShouldReturnNotFound_WhenLibraryDoesNotExist()
    {
        //Arrange
        var testDb = GetDbContext();    //Create a connection to the test temporary database

        await SeedLibrariesAsync(testDb);

        var controller = new LibrariesController(testDb);
        // Pass the DB connection to the Controller and create an instance
        // Normally, ASP.NET would automatically create this using DI. In testing, it's passed manually

        //Act
        var result = await controller.GetById(99); //Get information about non-existent number 999

        //Assert
        Assert.IsType<NotFoundResult>(result.Result);   //A 404 NotFound error should be returned
    }


    [Fact]
    public async Task GetAll_ShouldReturnAllLibrariesInIdOrder()
    {
        using var testDb = GetDbContext();

        await SeedLibrariesAsync(testDb);
        
        var controller = new LibrariesController(testDb);

        var result = await controller.GetAll();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var items = Assert.IsType<List<Library>>(okResult.Value);

        Assert.Equal(2, items.Count);
        Assert.Equal(1, items[0].Id);
        Assert.Equal("Adelaide City Library", items[0].Name);
        Assert.Equal(2, items[1].Id);
        Assert.Equal("Burnside Library", items[1].Name);
    }

    [Fact]
    public async Task GetById_ShouldReturnLibrary_WhenLibraryExists()
    {
        using var testDb = GetDbContext();

        await SeedLibrariesAsync(testDb);

        var controller = new LibrariesController(testDb);

        var result = await controller.GetById(1);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var item = Assert.IsType<Library>(okResult.Value);

        Assert.Equal(1, item.Id);
        Assert.Equal("Adelaide City Library", item.Name);
    }
}
