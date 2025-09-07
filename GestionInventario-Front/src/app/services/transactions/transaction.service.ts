import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'; 
import { environment } from '../../../environments/environment';
import { Transaction, TRANSACTION_TYPE_CONFIG } from '../../models/transaction.model';
import { get } from 'http';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.transactionServiceUrl}/transactions`;
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTransactions();
  }

  private loadTransactions(): void {
    this.getTransactions().subscribe({
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.transactionsSubject.next([]);
      }
    });
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl).pipe(
      tap(transactions => {
        this.transactionsSubject.next(transactions);
      }),
      catchError(this.handleError)
    );
  }

  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getTransactionConfig(transaction: Transaction) { 
    if (!transaction?.tipo) return null; 
    return TRANSACTION_TYPE_CONFIG[transaction.tipo];
  } 

 
  createTransaction(transaction: Transaction): Observable<Transaction> { 
    this.getTransactionConfig(transaction);

    if (!transaction.totalPrice) {
      transaction.totalPrice = transaction.quantity * transaction.unitPrice;
    }

    if (typeof transaction.transactionDate === 'string') {
      transaction.transactionDate = new Date(transaction.transactionDate);
    }

    return this.http.post<Transaction>(this.apiUrl, transaction).pipe(
      tap(newTransaction => {
        const currentTransactions = this.transactionsSubject.value;
        this.transactionsSubject.next([...currentTransactions, newTransaction]);
      }),
      catchError(this.handleError)
    );
  }

  updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
    transaction.totalPrice = transaction.quantity * transaction.unitPrice;

    if (typeof transaction.transactionDate === 'string') {
      transaction.transactionDate = new Date(transaction.transactionDate);
    }

    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction).pipe(
      tap(updatedTransaction => {
        const currentTransactions = this.transactionsSubject.value;
        const updatedTransactions = currentTransactions.map(t =>
          t.id === id ? updatedTransaction : t
        );
        this.transactionsSubject.next(updatedTransactions);
      }),
      catchError(this.handleError)
    );
  } 

  searchTransactions(filters: any): Observable<Transaction[]> {
    let params = new HttpParams();

    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.productId) params = params.set('productId', filters.productId.toString());
    if (filters.minAmount) params = params.set('minAmount', filters.minAmount.toString());
    if (filters.maxAmount) params = params.set('maxAmount', filters.maxAmount.toString());

    return this.http.get<Transaction[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getTransactionsByProduct(productId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/product/${productId}`).pipe(
      catchError(this.handleError)
    );
  }

  getTransactionStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error en el servicio de transacciones';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor';
          break;
        case 400:
          errorMessage = 'Datos inválidos en la solicitud';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 409:
          errorMessage = 'Conflicto: La transacción ya existe';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  validateStockForSale(productId: number, quantity: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/validate-stock/${productId}?quantity=${quantity}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteTransaction(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}