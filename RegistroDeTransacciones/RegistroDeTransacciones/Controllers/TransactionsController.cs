using Microsoft.AspNetCore.Mvc;
using RegistroDeTransacciones.Dto;
using RegistroDeTransacciones.Models;
using RegistroDeTransacciones.Services;

namespace RegistroDeTransacciones.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _service;

        public TransactionsController(ITransactionService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TransactionModels tr)
        {
            var result = await _service.CreateAsync(tr); 
            return Created(string.Empty, result);
        }

        [HttpGet("/product/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId, [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string type)
        {
            var result = await _service.GetByProductAsync(productId, from, to, type);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var p = await _service.GetByIdAsync(id);
            if (p == null) return NotFound();
            return Ok(p);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? productoId, [FromQuery] TransactionModels.TransactionType? tipo, [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
        { 
            var result = await _service.GetTransactions(productoId, tipo, desde, hasta);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTransactionDto dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            existing.Detail = dto.Detail; 
            await _service.UpdateAsync(existing);
            return NoContent();
        }
    }
}
