import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthSession, AuthUser, LoginPayload, LoginResponse, LoginResponseData } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'efactzy_access_token';
const REFRESH_TOKEN_KEY = 'efactzy_refresh_token';
const TOKEN_TYPE_KEY = 'efactzy_token_type';
const EXPIRES_IN_KEY = 'efactzy_expires_in';
const USER_KEY = 'efactzy_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal<boolean>(this.hasSession());
  readonly user = signal<AuthUser | null>(this.readUserFromStorage());

  constructor(private readonly http: HttpClient) {}

  login(usernameOrEmail: string, password: string): Observable<void> {
    const payload: LoginPayload = { usernameOrEmail, password };

    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, payload)
      .pipe(
        map((response) => {
          if (response.status && response.status !== 'success') {
            throw new Error(response.message || 'Credenciales inválidas.');
          }

          if (response.code && response.code !== 200) {
            throw new Error(response.message || 'Credenciales inválidas.');
          }

          return this.extractSession(response);
        }),
        tap((session) => this.persistSession(session)),
        catchError((error) => {
          throw this.normalizeLoginError(error);
        }),
        map(() => void 0),
      );
  }

  logout(): void {
    this.clearSessionStorage();
    this.user.set(null);
    this.isAuthenticated.set(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getTokenType(): string | null {
    return localStorage.getItem(TOKEN_TYPE_KEY);
  }

  getExpiresIn(): string | null {
    return localStorage.getItem(EXPIRES_IN_KEY);
  }

  getUserSnapshot(): AuthUser | null {
    return this.user();
  }

  getUserId(): string | null {
    const userId = this.user()?.idUsuario;

    return userId !== undefined && userId !== null ? String(userId) : null;
  }

  updateStoredUser(updatedUser: AuthUser): void {
    this.user.set(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }

  private hasSession(): boolean {
    return Boolean(this.getAccessToken());
  }

  private persistSession(session: AuthSession): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);

    if (session.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    }

    if (session.tokenType) {
      localStorage.setItem(TOKEN_TYPE_KEY, session.tokenType);
    }

    if (session.expiresIn !== undefined && session.expiresIn !== null) {
      localStorage.setItem(EXPIRES_IN_KEY, String(session.expiresIn));
    }

    if (session.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      this.user.set(session.user);
    }

    this.isAuthenticated.set(true);
  }

  private extractSession(response: LoginResponse): AuthSession {
    const source = response.data ?? (response as LoginResponseData);

    const accessToken = source.accessToken ?? source.token;

    if (!accessToken) {
      throw new Error('La respuesta de login no contiene accessToken.');
    }

    return {
      accessToken,
      refreshToken: source.refreshToken,
      tokenType: source.tokenType,
      expiresIn: source.expiresIn,
      user: source.usuario ?? source.user,
    };
  }

  private normalizeLoginError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    if (error && typeof error === 'object') {
      const maybeError = error as { error?: unknown; message?: unknown };
      const payload = maybeError.error ?? error;

      if (payload && typeof payload === 'object') {
        const body = payload as { message?: unknown; messageCode?: unknown; statusCode?: unknown };

        if (typeof body.message === 'string') {
          return new Error(body.message);
        }

        if (Array.isArray(body.message)) {
          return new Error(body.message.join(' '));
        }

        if (typeof body.messageCode === 'string') {
          return new Error(body.messageCode);
        }
      }

      if (typeof maybeError.message === 'string') {
        return new Error(maybeError.message);
      }
    }

    return new Error('Credenciales inválidas o servicio no disponible.');
  }

  private readUserFromStorage(): AuthUser | null {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      return null;
    }
  }

  private clearSessionStorage(): void {
    [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_TYPE_KEY, EXPIRES_IN_KEY, USER_KEY].forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  getDisplayName(): string {
    const user = this.user();

    if (!user) {
      return 'Gian Pierre';
    }

    return [user.nombres, user.apellidos].filter(Boolean).join(' ').trim() || user.username || user.correo || 'Usuario';
  }

  getRoleLabel(): string {
    const role = this.user()?.rol;

    if (!role) {
      return 'Administrador';
    }

    return role
      .toString()
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  getAvatarInitials(): string {
    const user = this.user();

    if (!user) {
      return 'GP';
    }

    const first = user.nombres?.trim().charAt(0) ?? user.username?.trim().charAt(0) ?? 'G';
    const second = user.apellidos?.trim().charAt(0) ?? user.correo?.trim().charAt(0) ?? 'P';

    return `${first}${second}`.toUpperCase();
  }
}
