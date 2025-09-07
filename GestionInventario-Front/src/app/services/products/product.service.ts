import { Injectable } from '@angular/core'; 
import { Observable, throwError } from 'rxjs';
import { Product } from '../../models/product.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService { 
  private apiUrl = `${environment.productServiceUrl}/products`;
 
  constructor(private http: HttpClient) { 
    this.getProductsAll().subscribe({
      next: (products) => {
        console.log('Productos cargados:', products);
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
      }
    });
  }

  getProductsAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: number | string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${product.id}`, product);
  }

  deleteProduct(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en ProductService:', error);
    return throwError(() => new Error('Error al procesar la solicitud'));
  }
}
