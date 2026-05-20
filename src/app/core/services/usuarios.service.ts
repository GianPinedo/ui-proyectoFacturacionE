import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AsignarModulosRolPayload,
  AsignarModulosRolResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  CreateRolPayload,
  CreateRolResponse,
  CreateUsuarioPayload,
  CreateUsuarioResponse,
  ModulosListParams,
  ModulosListResponse,
  ResetUsuarioPasswordPayload,
  ResetUsuarioPasswordResponse,
  ModulosPermisosRolResponse,
  RolDetailResponse,
  RolesListParams,
  RolesListResponse,
  UpdateRolPayload,
  UpdateRolEstadoPayload,
  UpdateRolEstadoResponse,
  UpdateRolResponse,
  UpdateUsuarioEstadoPayload,
  UpdateUsuarioEstadoResponse,
  UsuarioDetailResponse,
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

  updateUsuarioEstado(usuarioId: string, payload: UpdateUsuarioEstadoPayload): Observable<UpdateUsuarioEstadoResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.patch<UpdateUsuarioEstadoResponse>(`${environment.apiBaseUrl}/usuarios/${usuarioId}/estado`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  resetUsuarioPassword(usuarioId: string, payload: ResetUsuarioPasswordPayload): Observable<ResetUsuarioPasswordResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.put<ResetUsuarioPasswordResponse>(`${environment.apiBaseUrl}/usuarios/${usuarioId}/reset-password`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  getUsuarioById(usuarioId: string): Observable<UsuarioDetailResponse> {
    return this.http.get<UsuarioDetailResponse>(`${environment.apiBaseUrl}/usuarios/${usuarioId}`);
  }

  createRol(payload: CreateRolPayload): Observable<CreateRolResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.post<CreateRolResponse>(`${environment.apiBaseUrl}/roles`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  updateRol(rolId: string, payload: UpdateRolPayload): Observable<UpdateRolResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.put<UpdateRolResponse>(`${environment.apiBaseUrl}/roles/${rolId}`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  updateRolEstado(rolId: string, payload: UpdateRolEstadoPayload): Observable<UpdateRolEstadoResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.patch<UpdateRolEstadoResponse>(`${environment.apiBaseUrl}/roles/${rolId}/estado`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  getRolById(rolId: string): Observable<RolDetailResponse> {
    return this.http.get<RolDetailResponse>(`${environment.apiBaseUrl}/roles/${rolId}`);
  }

  getModulosPermisosPorRol(rolId: string): Observable<ModulosPermisosRolResponse> {
    return this.http.get<ModulosPermisosRolResponse>(`${environment.apiBaseUrl}/modulos/permisos/rol/${rolId}`);
  }

  getMisPermisosModulos(): Observable<ModulosPermisosRolResponse> {
    return this.http.get<ModulosPermisosRolResponse>(`${environment.apiBaseUrl}/modulos/mis-permisos`);
  }

  getModulos(params: ModulosListParams): Observable<ModulosListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.estado?.trim()) {
      httpParams = httpParams.set('estado', params.estado.trim());
    }

    return this.http.get<ModulosListResponse>(`${environment.apiBaseUrl}/modulos`, {
      params: httpParams,
    });
  }

  asignarModulosPermisosRol(payload: AsignarModulosRolPayload): Observable<AsignarModulosRolResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.post<AsignarModulosRolResponse>(`${environment.apiBaseUrl}/modulos/permisos/asignar`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }
}
