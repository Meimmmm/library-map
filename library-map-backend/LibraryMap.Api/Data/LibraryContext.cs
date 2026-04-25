using Microsoft.EntityFrameworkCore;
using LibraryMap.Api.Models;

namespace LibraryMap.Api.Data
{
    public class LibraryContext : DbContext
    {
        public LibraryContext(DbContextOptions<LibraryContext> options)
            : base(options)
        {
        }

        //This maps C#'s Library class to the Database's Libraries table
        public DbSet<Library> Libraries => Set<Library>();  // Table name "Libraries"
    }
}
