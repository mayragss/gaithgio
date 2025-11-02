import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  orderNumber?: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  OrderItems?: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: CreateOrderRequest): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    console.log('Enviando pedido para:', this.baseUrl);
    console.log('Dados do pedido:', orderData);
    console.log('Headers:', { Authorization: `Bearer ${token}` });
    
    return this.http.post<any>(this.baseUrl, orderData, { headers });
  }

  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/by-user/${userId}`);
  }

  getMyOrders(): Observable<Order[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    const url = `${this.baseUrl}/my-orders`;
    console.log('getMyOrders() chamado');
    console.log('URL:', url);
    console.log('Token presente:', !!token);
    
    return this.http.get<Order[]>(url, { headers });
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.put<any>(`${this.baseUrl}/${orderId}/status`, { status }, { headers });
  }
}


