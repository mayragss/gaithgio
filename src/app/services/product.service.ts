import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';



@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = /*'https://5da4b0b2d087.ngrok-free.app/products'*/ 'http://localhost:3000/products'; // ajuste a URL conforme sua API

  constructor(private http: HttpClient) { }

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getFiltered(filters: Record<string, any>) {
    let params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    return this.http.get<Product[]>(`${this.apiUrl}?${params.toString()}`);
  }
}
