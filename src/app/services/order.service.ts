import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderRequest {
  userId: number;
  items: OrderItem[];
  paymentMethod?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: CreateOrderRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl, orderData);
  }

  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/by-user/${userId}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${orderId}/status`, { status });
  }
}


