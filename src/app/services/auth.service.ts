import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<boolean> {
    const credentials: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.decodeAndStoreUser(response.token);
          // Buscar dados completos do usuário após login
          this.loadUserProfile();
        }),
        map(() => true),
        catchError(() => of(false))
      );
  }

  loginWithCredentials(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.decodeAndStoreUser(response.token);
          // Buscar dados completos do usuário após login
          this.loadUserProfile();
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshUserProfile(): Observable<User | null> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }
    
    return this.http.get<any>(`${this.baseUrl}/member`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(response => {
        // O backend retorna { message, user: { ... } }
        const userData = response.user || response;
        const user: User = {
          id: userData.id?.toString() || '',
          email: userData.email || '',
          password: '', // Não armazenamos a senha
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
          createdAt: new Date(userData.createdAt || Date.now()),
          updatedAt: new Date(userData.updatedAt || Date.now()),
          addresses: userData.addresses || userData.Addresses || [],
          orders: userData.orders || userData.Orders || []
        };
        this.currentUserSubject.next(user);
      }),
      map(response => {
        // O backend retorna { message, user: { ... } }
        const userData = response.user || response;
        const mappedUser = {
          id: userData.id?.toString() || '',
          email: userData.email || '',
          password: '',
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
          createdAt: new Date(userData.createdAt || Date.now()),
          updatedAt: new Date(userData.updatedAt || Date.now()),
          addresses: userData.addresses || userData.Addresses || [],
          orders: userData.orders || userData.Orders || []
        } as User;
        return mappedUser;
      }),
      catchError(error => {
        console.error('Error refreshing user profile:', error);
        return of(null);
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    // Transform the data to match backend expectations
    const backendData = {
      email: userData.email,
      password: userData.password,
      name: `${userData.firstName} ${userData.lastName}`.trim(),
      phone: userData.phone
    };
    
    return this.http.post<any>(`${this.baseUrl}/users/register`, backendData)
      .pipe(
        tap(response => {
          if (response.user && response.user.token) {
            localStorage.setItem('token', response.user.token);
            this.decodeAndStoreUser(response.user.token);
          }
        })
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/forgot-password`, { email });
  }

  addAddress(addressData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.post<any>(`${this.baseUrl}/address`, addressData, { headers });
  }

  updateAddress(addressId: number, addressData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.put<any>(`${this.baseUrl}/address/${addressId}`, addressData, { headers });
  }

  deleteAddress(addressId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.delete<any>(`${this.baseUrl}/address/${addressId}`, { headers });
  }

  updateProfile(profileData: any): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }
    
    return this.http.put<any>(`${this.baseUrl}/member`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    if (token && this.isLoggedIn()) {
      this.decodeAndStoreUser(token);
      // Buscar dados completos do usuário se já estiver logado
      this.loadUserProfile();
    }
  }

  private loadUserProfile(): void {
    const token = this.getToken();
    if (token) {
      this.http.get<any>(`${this.baseUrl}/member`, {
        headers: { Authorization: `Bearer ${token}` }
      }).pipe(
        tap(response => {
          // O backend retorna { message, user: { ... } }
          const userData = response.user || response;
          const user: User = {
            id: userData.id?.toString() || '',
            email: userData.email || '',
            password: '', // Não armazenamos a senha
            firstName: userData.firstName || userData.name?.split(' ')[0] || '',
            lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
            phone: userData.phone || '',
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
            createdAt: new Date(userData.createdAt || Date.now()),
            updatedAt: new Date(userData.updatedAt || Date.now()),
            addresses: userData.addresses || userData.Addresses || [],
            orders: userData.orders || userData.Orders || []
          };
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Error loading user profile:', error);
          return of(null);
        })
      ).subscribe();
    }
  }

  private decodeAndStoreUser(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        id: payload.id?.toString() || '',
        email: payload.email || '',
        password: '', // Not stored in token for security
        firstName: payload.firstName || payload.name?.split(' ')[0] || '',
        lastName: payload.lastName || payload.name?.split(' ').slice(1).join(' ') || '',
        phone: payload.phone || '',
        dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined,
        createdAt: new Date(payload.createdAt || Date.now()),
        updatedAt: new Date(payload.updatedAt || Date.now()),
        addresses: payload.addresses || [],
        orders: payload.orders || []
      };
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
    }
  }
}