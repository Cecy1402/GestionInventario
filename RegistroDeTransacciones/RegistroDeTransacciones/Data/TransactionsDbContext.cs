using Microsoft.EntityFrameworkCore;
using RegistroDeTransacciones.Models; 
using System.Reflection.Emit;

namespace RegistroDeTransacciones.Data
{
    public class TransactionsDbContext : DbContext
    {
        public TransactionsDbContext(DbContextOptions<TransactionsDbContext> options) : base(options) { }
        public DbSet<TransactionModels> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TransactionModels>().ToTable("Transactions");
        }
    }
}
