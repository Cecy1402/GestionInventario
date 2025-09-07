using GestionDeProducto.Dto;
using GestionDeProducto.Models;
using GestionDeProducto.Services;
using Microsoft.AspNetCore.Mvc;

namespace GestionDeProducto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;

        public ProductsController(IProductService service) { _service = service; }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var p = await _service.GetByIdAsync(id);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var p = new ProductModels { Name = dto.Name, Description = dto.Description, Category = dto.Category, ImageUrl = dto.ImageUrl, Price = dto.Price, Stock = dto.Stock };
            var created = await _service.CreateAsync(p);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductCreateDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            existing.Name = dto.Name;
            existing.Description = dto.Description;
            existing.Category = dto.Category;
            existing.ImageUrl = dto.ImageUrl;
            existing.Price = dto.Price;
            existing.Stock = dto.Stock;
            await _service.UpdateAsync(existing);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpPatch("{id}/adjust-stock")]
        public async Task<IActionResult> AdjustStock(int id, [FromQuery] int delta)
        {
            try
            { 
                var ok = await _service.AdjustStockAsync(id, delta);
                if (!ok) return BadRequest(new { message = "No se pudo ajustar el stock (producto no existe o stock insuficiente)." });

            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Internal server error",
                    error = ex.Message
                });
            }

            return Ok();
        } 
    }
}
