using GestionDeProducto.Data;
using GestionDeProducto.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionDeProducto.Services
{
    public class ProductService : IProductService
    {
        private readonly ProductsDbContext _db;

        public ProductService(ProductsDbContext db) { _db = db; }

        public async Task<ProductModels> CreateAsync(ProductModels p)
        {
            try
            {
                _db.Products.Add(p);
                await _db.SaveChangesAsync();

                return p;
            }

            catch (Exception ex)
            {
                Console.WriteLine($"Error al crear producto: {ex.Message}\n{ex.StackTrace}");
                throw;
            } 
        }

        public async Task DeleteAsync(int id)
        {
            var p = await _db.Products.FindAsync(id);
            if (p == null) return;
            _db.Products.Remove(p);
            await _db.SaveChangesAsync();
        }

        public async Task<IEnumerable<ProductModels>> GetAllAsync() => await _db.Products.AsNoTracking().ToListAsync();

        public async Task<ProductModels> GetByIdAsync(int id) => await _db.Products.FindAsync(id);

        public async Task UpdateAsync(ProductModels product)
        {
            product.UpdatedAt = DateTime.UtcNow;
            _db.Products.Update(product);
            await _db.SaveChangesAsync();
        }

        public async Task<bool> AdjustStockAsync(int productId, int delta)
        { 
            var p = await _db.Products.FindAsync(productId);
            if (p == null) return false;
            int newStock = p.Stock + delta;
            if (newStock < 0) return false;
            p.Stock = newStock;
            p.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

    }
}
