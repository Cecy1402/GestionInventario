// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class ApiService {
// //   constructor(private http: HttpClient) { }

// //   get<T>(path: string, params?: any): Observable<T> {
// //     let httpParams = new HttpParams();
// //     if (params) {
// //       Object.keys(params).forEach(key => {
// //         if (params[key] != null) httpParams = httpParams.set(key, params[key]);
// //       });
// //     }
// //     return this.http.get<T>(`${environment.apiBase}${path}`, { params: httpParams });
// //   }

// //   post<T>(path: string, body: any): Observable<T> {
// //     return this.http.post<T>(`${environment.apiBase}${path}`, body);
// //   }

// //   put<T>(path: string, body: any): Observable<T> {
// //     return this.http.put<T>(`${environment.apiBase}${path}`, body);
// //   }

// //   delete<T>(path: string): Observable<T> {
// //     return this.http.delete<T>(`${environment.apiBase}${path}`);
// //   }
// // }
