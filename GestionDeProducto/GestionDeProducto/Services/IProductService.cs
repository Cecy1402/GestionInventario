using GestionDeProducto.Models;

namespace GestionDeProducto.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductModels>> GetAllAsync();
        Task<ProductModels> GetByIdAsync(int id);
        Task<ProductModels> CreateAsync(ProductModels product);
        Task UpdateAsync(ProductModels product);
        Task DeleteAsync(int id);
        Task<bool> AdjustStockAsync(int productId, int delta);
    }
}
