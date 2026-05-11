import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordPayload,
  ChangePasswordResponse,
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
}
