using RegistroDeTransacciones.Models;

namespace RegistroDeTransacciones.Services
{
    public interface ITransactionService
    {
        Task<TransactionModels> CreateAsync(TransactionModels tr);
        Task<IEnumerable<TransactionModels>> GetByProductAsync(int productId, DateTime? from = null, DateTime? to = null, string type = null);
        Task<List<TransactionModels>> GetTransactions(int? productoId = null, TransactionModels.TransactionType? tipo = null, DateTime? desde = null, DateTime? hasta = null);
        Task DeleteAsync(int id);
        Task<TransactionModels> GetByIdAsync(int id);
        Task UpdateAsync(TransactionModels product);
    }
}
