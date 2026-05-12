import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EmpresaPayload,
  EmpresaResponse,
  EmpresasListParams,
  EmpresasListResponse,
  UpdateEmpresaEstadoPayload,
} from '../models/empresa.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getEmpresas(params: EmpresasListParams): Observable<EmpresasListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size)
      .set('sortBy', 'createdAt')
      .set('sortDir', 'DESC');

    if (params.ruc?.trim()) {
      httpParams = httpParams.set('ruc', params.ruc.trim());
    }

    if (params.razonSocial?.trim()) {
      httpParams = httpParams.set('razonSocial', params.razonSocial.trim());
    }

    if (params.estado?.trim()) {
      httpParams = httpParams.set('estado', params.estado.trim());
    }

    return this.http.get<EmpresasListResponse>(`${environment.apiBaseUrl}/empresas`, {
      params: httpParams,
    });
  }

  getEmpresaById(idEmpresa: string): Observable<EmpresaResponse> {
    return this.http.get<EmpresaResponse>(`${environment.apiBaseUrl}/empresas/${idEmpresa}`);
  }

  createEmpresa(payload: EmpresaPayload): Observable<EmpresaResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.post<EmpresaResponse>(`${environment.apiBaseUrl}/empresas`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  updateEmpresa(idEmpresa: string, payload: EmpresaPayload): Observable<EmpresaResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.put<EmpresaResponse>(`${environment.apiBaseUrl}/empresas/${idEmpresa}`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  updateEmpresaEstado(idEmpresa: string, payload: UpdateEmpresaEstadoPayload): Observable<EmpresaResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.patch<EmpresaResponse>(`${environment.apiBaseUrl}/empresas/${idEmpresa}/estado`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }
}

