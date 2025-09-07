using GestionDeProducto.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionDeProducto.Data
{
    public class ProductsDbContext : DbContext
    {
        public ProductsDbContext(DbContextOptions<ProductsDbContext> options) : base(options) { }
         
        public DbSet<ProductModels> Products { get; set; }
         
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProductModels>().ToTable("Products");
        }
    }
}
