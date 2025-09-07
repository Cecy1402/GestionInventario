import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; 
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/products/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadProduct(id);
    });
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar el producto: ' + error.message;
        this.isLoading = false;
        console.error('Error loading product:', error);
      }
    });
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock < 5) return 'Stock bajo';
    return 'Disponible';
  }

  getStockBadgeClass(stock: number): string {
    if (stock === 0) return 'bg-danger';
    if (stock < 5) return 'bg-warning';
    return 'bg-success';
  }

  editProduct(): void {
    if (this.product) {
      this.router.navigate(['/products/edit', this.product.id]);
    }
  }

  deleteProduct(): void {
    if (this.product && confirm('¿Estás seguro de eliminar este producto?')) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: () => {
          alert('Producto eliminado correctamente');
          this.router.navigate(['/products']);
        },
        error: (error) => {
          alert('Error al eliminar producto: ' + error.message);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  registerPurchase(): void {
    if (this.product) {
      this.router.navigate(['/transactions/new'], {
        queryParams: { 
          type: 'compra', 
          productId: this.product.id,
          productName: this.product.name
        }
      });
    }
  }

  registerSale(): void {
    if (this.product) {
      this.router.navigate(['/transactions/new'], {
        queryParams: { 
          type: 'venta', 
          productId: this.product.id,
          productName: this.product.name
        }
      });
    }
  }

  viewTransactions(): void {
    if (this.product) {
      this.router.navigate(['/transaction-search'], {
        queryParams: { productId: this.product.id }
      });
    }
  }
}