import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../services/transactions/transaction.service';
import { Router, RouterModule } from '@angular/router';
import { Transaction, TRANSACTION_TYPE_CONFIG } from '../../../models/transaction.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transaction-list',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  searchTerm: string = '';

  filterDateStart: string = '';
  filterDateEnd: string = '';
  filterText: string = '';

  constructor(
    private transactionService: TransactionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
  }
  loadTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.isLoading = false;
        this.filteredTransactions = transactions;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.errorMessage = 'Error al cargar las transacciones';
        this.isLoading = false;
      }
    });
  }


  getTransactionConfig(transaction: Transaction) {
    if (!transaction?.tipo) return null;
    return TRANSACTION_TYPE_CONFIG[transaction.tipo];
  }

  viewTransactionDetails(transaction: Transaction): void {
    this.router.navigate(['/transactions/detail', transaction.id]);
  }

  editTransaction(transaction: Transaction): void {
    this.router.navigate(['/transactions/edit', transaction.id]);
  }

  deleteTransaction(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.loadTransactions();
          alert('Transacción eliminada correctamente');
        },
        error: (error) => {
          alert('Error al eliminar la transacción: ' + error.message);
        }
      });
    }
  }

  getPurchaseCount(): number {
    return this.transactions.filter(t => t.tipo === 0).length;
  }

  getSaleCount(): number {
    return this.transactions.filter(t => t.tipo === 1).length;
  }

  getTotalAmount(): number {
    return this.transactions.reduce((total, t) => total + t.totalPrice, 0);
  }

  getCurrentStock(transaction: Transaction): number {
    return transaction.quantity || 0;
  }

  filterTransactions(): void {
    if (!this.searchTerm) {
      this.filteredTransactions = this.transactions;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredTransactions = this.transactions.filter(transactions =>
      transactions.detail.toLowerCase().includes(term)
    );
  }

  get hasActiveFilters(): boolean {
    return !!this.filterDateStart || !!this.filterDateEnd || !!this.filterText;
  }

  cleanFilter() {
    this.filterDateStart = '';
    this.filterDateEnd = '';
    this.filterText = '';
    this.filteredTransactions = this.transactions;
  }

  aplyFilter() {
    this.filteredTransactions = this.transactions.filter(transaction => {

      const fechaTransaccion = new Date(transaction.transactionDate);
      let dateSearch = true;

      if (this.filterDateStart) {
        const fechaDesde = new Date(this.filterDateStart);
        dateSearch = dateSearch && fechaTransaccion >= fechaDesde;

        console.log('inicio:', fechaTransaccion)
      }

      if (this.filterDateEnd) {
        const fechaHasta = new Date(this.filterDateEnd);
        fechaHasta.setHours(23, 59, 59, 999);  
        dateSearch = dateSearch && fechaTransaccion <= fechaHasta;
      }


      let matchesText = true;
      if (this.filterText) {
        const searchText = this.filterText.toLowerCase();

        matchesText = Boolean(
          transaction.productId.toString().includes(searchText) ||
          (transaction.productName && transaction.productName.toLowerCase().includes(searchText)) ||
          (transaction.detail && transaction.detail.toLowerCase().includes(searchText))
        );
      } 

      return dateSearch && matchesText;
    });
  }

}


