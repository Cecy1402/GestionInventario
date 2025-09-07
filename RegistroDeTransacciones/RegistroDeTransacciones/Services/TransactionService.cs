using Microsoft.EntityFrameworkCore;
using RegistroDeTransacciones.Data;
using RegistroDeTransacciones.Models;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;  
using static RegistroDeTransacciones.Models.TransactionModels;

namespace RegistroDeTransacciones.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly TransactionsDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _productServiceBaseUrl;

        public TransactionService(TransactionsDbContext db, IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _db = db;
            _httpClientFactory = httpClientFactory;
            _productServiceBaseUrl = config["ProductService:BaseUrl"] ?? "http://product-service";
        }

        private class ProductDto
        {
            public int Id { get; set; }
            public int Stock { get; set; }
        }

        private async Task<ProductDto> GetProductFromService(int productId)
        {
            var client = _httpClientFactory.CreateClient("products");
            client.BaseAddress = new Uri(_productServiceBaseUrl);

            var resp = await client.GetAsync($"api/products/{productId}");
            if (!resp.IsSuccessStatusCode)
                throw new Exception("Producto no encontrado");

            var product = await resp.Content.ReadFromJsonAsync<ProductDto>();
            return product!;
        }


        public async Task<TransactionModels> CreateAsync(TransactionModels tr)
        {
            using var transaction = await _db.Database.BeginTransactionAsync();

            try
            { 
                if (tr.Quantity <= 0)
                    throw new InvalidOperationException("La cantidad debe ser mayor a 0");

                if (tr.UnitPrice <= 0)
                    throw new InvalidOperationException("El precio unitario debe ser mayor a 0");

                tr.TotalPrice = tr.UnitPrice * tr.Quantity;
                 
                var product = await GetProductFromService(tr.ProductId);
                if (product == null)
                    throw new InvalidOperationException($"Producto con ID {tr.ProductId} no existe");
                 
                if (tr.Tipo == TransactionModels.TransactionType.Venta)
                {
                    if (product.Stock < tr.Quantity)
                        throw new InvalidOperationException(
                            $"Stock insuficiente. Stock actual: {product.Stock}, Solicitado: {tr.Quantity}");
                }
                int stockDelta = tr.Tipo == TransactionModels.TransactionType.Venta
                ? -tr.Quantity
                : tr.Quantity;

                var (success, errorMessage) = await AdjustStockAsync(tr.ProductId, stockDelta);

                if (!success)
                {
                    throw new InvalidOperationException(
                        $"Error al ajustar el stock del producto: {errorMessage}");
                }

                _db.Transactions.Add(tr);
                await _db.SaveChangesAsync();
                 
                await transaction.CommitAsync();

                return tr;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<(bool Success, string ErrorMessage)> AdjustStockAsync(int productId, int delta)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("products");
                client.BaseAddress = new Uri(_productServiceBaseUrl);
                 
                var response = await client.PatchAsync($"api/products/{productId}/adjust-stock?delta={delta}", null);
                if (!response.IsSuccessStatusCode)
                    throw new Exception("Producto no encontrado");
                 
                if (response.IsSuccessStatusCode)
                    return (true, string.Empty);
                
                var errorContent = await response.Content.ReadAsStringAsync();
                return (false, $"HTTP {(int)response.StatusCode}: {errorContent}");
            }
            catch (Exception ex)
            {
                return (false, $"Exception: {ex.Message}");
            }
        }

        public async Task<IEnumerable<TransactionModels>> GetByProductAsync(
            int productId, DateTime? from = null, DateTime? to = null, string? type = null)
        {
            var query = _db.Transactions.AsQueryable().Where(t => t.ProductId == productId);

            if (from.HasValue) query = query.Where(t => t.TransactionDate >= from.Value);
            if (to.HasValue) query = query.Where(t => t.TransactionDate <= to.Value);
            if (!string.IsNullOrWhiteSpace(type))
            {
                if (Enum.TryParse<TransactionModels.TransactionType>(type, out var tipoEnum))
                    query = query.Where(t => t.Tipo == tipoEnum);
            }

            return await query.OrderByDescending(t => t.TransactionDate).ToListAsync();
        }

        public async Task<List<TransactionModels>> GetTransactions(int? productoId = null, TransactionType? tipo = null, DateTime? desde = null, DateTime? hasta = null)
        {
            var query = _db.Transactions.AsQueryable();

            if (productoId.HasValue)
                query = query.Where(t => t.ProductId == productoId.Value);
            if (tipo.HasValue)
                query = query.Where(t => t.Tipo == tipo.Value);
            if (desde.HasValue)
                query = query.Where(t => t.TransactionDate >= desde.Value);
            if (hasta.HasValue)
                query = query.Where(t => t.TransactionDate <= hasta.Value);

            return await query.ToListAsync();
        }
         
        public async Task<TransactionModels> GetByIdAsync(int id) => await _db.Transactions.FindAsync(id);
        
        public async Task DeleteAsync(int id)
        {
            var p = await _db.Transactions.FindAsync(id);
            if (p == null) return;
            _db.Transactions.Remove(p);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(TransactionModels transaction)
        { 

            _db.Transactions.Update(transaction);
            await _db.SaveChangesAsync();

            var (success, errorMessage) = await AdjustStockAsync(transaction.Id, transaction.Quantity);
        }
    }
}

