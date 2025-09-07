using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RegistroDeTransacciones.Models
{
    public class TransactionModels
    {
        public enum TransactionType
        {
            Compra = 0,     
            Venta = 1     
        }

        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime TransactionDate { get; set; }

        [Required]
        public TransactionType Tipo { get; set; }

        [Required]
        public int ProductId { get; set; }

        //[ForeignKey("ProductoId")]
        //public Product Producto { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        public string Detail { get; set; }
    }
}
