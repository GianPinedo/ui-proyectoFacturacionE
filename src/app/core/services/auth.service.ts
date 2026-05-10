import { Injectable, signal } from '@angular/core';

const SESSION_KEY = 'efactzy-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal<boolean>(this.hasSession());

  login(_user: string, _password: string): void {
    localStorage.setItem(SESSION_KEY, 'active');
    this.isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.isAuthenticated.set(false);
  }

  private hasSession(): boolean {
    return localStorage.getItem(SESSION_KEY) === 'active';
  }
}
