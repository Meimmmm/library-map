using LibraryMap.Api.Data;
using LibraryMap.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryMap.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LibrariesController : ControllerBase
    {
        private readonly LibraryContext _db;

        public LibrariesController(LibraryContext db)
        {
            _db = db;
        }

        // GET: /api/libraries
        [HttpGet]
        public async Task<ActionResult<List<Library>>> GetAll()
        {
            var items = await _db.Libraries
                .OrderBy(x => x.Id)
                .ToListAsync();

            return Ok(items);
        }

        // GET: /api/libraries/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Library>> GetById(int id)
        {
            var item = await _db.Libraries.FindAsync(id);  //Check the DbContext's tracking cache (Change Tracker) first, and if not found, query the DB
            if (item is null) return NotFound();
            return Ok(item);
        }

        // POST: /api/libraries
        [HttpPost]
        public async Task<ActionResult<Library>> Create([FromBody] Library library)
        {
            _db.Libraries.Add(library);     //Add it to EF's "To Be Added" list
            await _db.SaveChangesAsync();   //Actually save to database. Id will be set after this

            return CreatedAtAction(nameof(GetById), new { id = library.Id }, library);  //201 Created with location header ★？？
        }
    }
}
