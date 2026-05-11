import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordPayload,
  ChangePasswordResponse,
  CreateUsuarioPayload,
  CreateUsuarioResponse,
  RolesListParams,
  RolesListResponse,
  UsuariosListParams,
  UsuariosListResponse,
  UpdateUsuarioPayload,
  UpdateUsuarioResponse,
} from '../models/usuario.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  updateUsuario(usuarioId: string, payload: UpdateUsuarioPayload): Observable<UpdateUsuarioResponse> {
    const xUserId = this.authService.getUserId() || usuarioId;

    return this.http.put<UpdateUsuarioResponse>(`${environment.apiBaseUrl}/usuarios/${usuarioId}`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  createUsuario(payload: CreateUsuarioPayload): Observable<CreateUsuarioResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.post<CreateUsuarioResponse>(`${environment.apiBaseUrl}/usuarios`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  changePassword(payload: ChangePasswordPayload): Observable<ChangePasswordResponse> {
    return this.http.put<ChangePasswordResponse>(`${environment.apiBaseUrl}/usuarios/me/password`, payload);
  }

  getUsuarios(params: UsuariosListParams): Observable<UsuariosListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.buscar?.trim()) {
      httpParams = httpParams.set('buscar', params.buscar.trim());
    }

    if (params.rol?.trim()) {
      httpParams = httpParams.set('rol', params.rol.trim());
    }

    return this.http.get<UsuariosListResponse>(`${environment.apiBaseUrl}/usuarios`, {
      params: httpParams,
    });
  }

  getRoles(params: RolesListParams): Observable<RolesListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.nombre?.trim()) {
      httpParams = httpParams.set('nombre', params.nombre.trim());
    }

    if (params.estado?.trim()) {
      httpParams = httpParams.set('estado', params.estado.trim());
    }

    return this.http.get<RolesListResponse>(`${environment.apiBaseUrl}/roles`, {
      params: httpParams,
    });
  }
}
