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

        public DbSet<Library> Libraries => Set<Library>();  // Table name "Libraries"
    }
}
