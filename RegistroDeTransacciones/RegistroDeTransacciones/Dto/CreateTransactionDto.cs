using System.ComponentModel.DataAnnotations;

namespace RegistroDeTransacciones.Dto
{
    public class CreateTransactionDto
    {
        [Required]
        public string TransactionType { get; set; }  
        [Required]
        public Guid ProductId { get; set; }
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        [Range(0, double.MaxValue)]
        public decimal UnitPrice { get; set; }
        public string Details { get; set; }
    }
}
