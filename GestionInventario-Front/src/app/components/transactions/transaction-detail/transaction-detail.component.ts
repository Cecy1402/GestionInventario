import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; 
import { Transaction, TRANSACTION_TYPE_CONFIG, TransactionType } from '../../../models/transaction.model';
import { TransactionService } from '../../../services/transactions/transaction.service';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/products/product.service';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent implements OnInit {
  transaction: Transaction | null = null;
  product: Product | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private transactionService: TransactionService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadTransaction(id);
    });
  }

  loadTransaction(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.transactionService.getTransactionById(id).subscribe({
      next: (transaction) => {
        this.transaction = transaction; 
        this.loadProductDetails(transaction.productId);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar la transacción: ' + error.message;
        this.isLoading = false;
        console.error('Error loading transaction:', error);
      }
    });
  }

  loadProductDetails(productId: number): void {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle transacción:', error);
        this.isLoading = false; 
      }
    });
  }

  
  get transactionConfig() {
    if (!this.transaction?.tipo) return null;

    return TRANSACTION_TYPE_CONFIG[this.transaction.tipo];
  } 
 
  getTransactionTypeIcon(): string {
    return this.transaction?.tipo === TransactionType.Compra ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle';
  }

  getTransactionTypeClass(): string {
    return this.transaction?.tipo === TransactionType.Compra ? 'bg-success' : 'bg-danger';
  }

  getTransactionTypeText(): string {
    return this.transaction?.tipo === TransactionType.Compra ? 'Compra' : 'Venta';
  }

  getTransactionAmountClass(): string {
    return this.transaction?.tipo === TransactionType.Compra ? 'text-success' : 'text-danger';
  }

  getTransactionAmountIcon(): string {
    return this.transaction?.tipo === TransactionType.Compra ? 'bi-arrow-down' : 'bi-arrow-up';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  editTransaction(): void {
    if (this.transaction) {
      this.router.navigate(['/transactions/edit', this.transaction.id]);
    }
  }

  deleteTransaction(): void {
    if (this.transaction && confirm('¿Estás seguro de eliminar esta transacción?')) {
      this.transactionService.deleteTransaction(this.transaction.id).subscribe({
        next: () => {
          alert('Transacción eliminada correctamente');
          this.router.navigate(['/transactions']);
        },
        error: (error) => {
          alert('Error al eliminar transacción: ' + error.message);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/transactions']);
  }

  viewTransactionDetails(): void {
    if (this.transaction) {
      this.router.navigate(['/transactions/detail', this.transaction.id]);
    }
  }

  getStockImpact(): string {
    if (!this.transaction) return '';
    
    return this.transaction.tipo === TransactionType.Compra
      ? `+${this.transaction.quantity} unidades` 
      : `-${this.transaction.quantity} unidades`;
  }

  getStockImpactClass(): string {
    return this.transaction?.tipo === TransactionType.Compra ? 'text-success' : 'text-danger';
  }

  calculateProfit(): number | null {
    if (!this.transaction || !this.product || this.transaction.tipo !== TransactionType.Compra) {
      return null;
    }

    const costPrice = this.product.price;  
    const salePrice = this.transaction.unitPrice;  
    return (salePrice - costPrice) * this.transaction.quantity;
  }

  hasProfit(): boolean {
    const profit = this.calculateProfit();
    return profit !== null && profit !== 0;
  }

  getProfitClass(): string {
    const profit = this.calculateProfit();
    if (profit === null) return 'text-muted';
    return profit > 0 ? 'text-success' : 'text-danger';
  }

  getProfitIcon(): string {
    const profit = this.calculateProfit();
    if (profit === null) return 'bi-info-circle';
    return profit > 0 ? 'bi-arrow-up-circle' : 'bi-arrow-down-circle';
  }
}