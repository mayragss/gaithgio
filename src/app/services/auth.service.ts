import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      // Simular autenticação - em produção, fazer chamada para API
      setTimeout(() => {
        // Mock de usuário para demonstração
        const mockUser: User = {
          id: '1',
          email: email,
          password: password,
          firstName: 'João',
          lastName: 'Silva',
          phone: '(11) 99999-9999',
          dateOfBirth: new Date('1990-01-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
          addresses: [],
          orders: []
        };

        this.currentUserSubject.next(mockUser);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  register(userData: Partial<User>): Observable<boolean> {
    return new Observable(observer => {
      // Simular registro - em produção, fazer chamada para API
      setTimeout(() => {
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email || '',
          password: userData.password || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth,
          createdAt: new Date(),
          updatedAt: new Date(),
          addresses: [],
          orders: []
        };

        this.currentUserSubject.next(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  updateUser(userData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData, updatedAt: new Date() };
      this.currentUserSubject.next(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  }
}
