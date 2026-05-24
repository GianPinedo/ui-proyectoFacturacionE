import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CertificadoValidacionResponse,
  EmpresaAmbienteRequest,
  EmpresaConfiguracionResponse,
  EmpresaCreateRequest,
  EmpresaCredencialesRequest,
  EmpresaEstadoRequest,
  EmpresaProveedorRequest,
  EmpresaResponse,
  EmpresaUpdateRequest,
  EmpresaValidacionEmisionResponse,
} from '../models/empresa.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private readonly baseUrl = `${environment.apiBaseUrl}/empresas`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getEmpresaPrincipal(): Observable<EmpresaResponse> {
    return this.http
      .get<ApiResponse<EmpresaResponse>>(`${this.baseUrl}/1`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => this.normalizeEmpresaResponse(response.data)),
        catchError((error: unknown) => {
          if (!this.shouldFallbackToList(error)) {
            return throwError(() => error);
          }

          return this.getEmpresaPrincipalFromListFallback();
        }),
      );
  }

  getById(idEmpresa: number): Observable<EmpresaResponse> {
    return this.http
      .get<ApiResponse<EmpresaResponse>>(`${this.baseUrl}/${idEmpresa}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => this.normalizeEmpresaResponse(response.data)));
  }

  create(request: EmpresaCreateRequest): Observable<EmpresaResponse> {
    return this.http
      .post<ApiResponse<EmpresaResponse>>(`${this.baseUrl}`, request, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => this.normalizeEmpresaResponse(response.data)));
  }

  update(idEmpresa: number, request: EmpresaUpdateRequest): Observable<EmpresaResponse> {
    return this.http
      .put<ApiResponse<EmpresaResponse>>(`${this.baseUrl}/${idEmpresa}`, request, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => this.normalizeEmpresaResponse(response.data)));
  }

  changeEstado(idEmpresa: number, request: EmpresaEstadoRequest): Observable<EmpresaResponse> {
    return this.http
      .patch<ApiResponse<EmpresaResponse>>(`${this.baseUrl}/${idEmpresa}/estado`, request, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => this.normalizeEmpresaResponse(response.data)));
  }

  updateAmbiente(idEmpresa: number, request: EmpresaAmbienteRequest): Observable<EmpresaResponse> {
    return this.http
      .patch<ApiResponse<EmpresaResponse>>(`${this.baseUrl}/${idEmpresa}/ambiente-emision`, request, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => this.normalizeEmpresaResponse(response.data)));
  }

  updateProveedor(idEmpresa: number, request: EmpresaProveedorRequest): Observable<EmpresaResponse> {
    return this.http
      .patch<ApiResponse<EmpresaResponse>>(`${this.baseUrl}/${idEmpresa}/proveedor-emision`, request, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => this.normalizeEmpresaResponse(response.data)));
  }

  updateCredenciales(idEmpresa: number, request: EmpresaCredencialesRequest): Observable<unknown> {
    return this.http
      .put<ApiResponse<unknown>>(`${this.baseUrl}/${idEmpresa}/credenciales-emision`, request, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => response.data));
  }

  uploadLogo(idEmpresa: number, file: File): Observable<EmpresaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<ApiResponse<EmpresaResponse>>(`${this.baseUrl}/${idEmpresa}/logo`, formData, {
        headers: this.getMultipartHeaders(),
      })
      .pipe(map((response) => this.normalizeEmpresaResponse(response.data)));
  }

  deleteLogo(idEmpresa: number): Observable<EmpresaResponse> {
    return this.http
      .delete<ApiResponse<EmpresaResponse>>(`${this.baseUrl}/${idEmpresa}/logo`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => this.normalizeEmpresaResponse(response.data)));
  }

  uploadCertificado(idEmpresa: number, file: File, clave: string, confirmacionClave: string): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clave', clave);
    formData.append('confirmacionClave', confirmacionClave);

    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/${idEmpresa}/certificado`, formData, {
        headers: this.getMultipartHeaders(),
      })
      .pipe(map((response) => response.data));
  }

  validarCertificado(idEmpresa: number): Observable<CertificadoValidacionResponse> {
    return this.http
      .post<ApiResponse<CertificadoValidacionResponse>>(
        `${this.baseUrl}/${idEmpresa}/certificado/validar`,
        null,
        { headers: this.getAuthHeaders() },
      )
      .pipe(map((response) => response.data));
  }

  validarEmision(idEmpresa: number): Observable<EmpresaValidacionEmisionResponse> {
    return this.http
      .get<ApiResponse<EmpresaValidacionEmisionResponse>>(`${this.baseUrl}/${idEmpresa}/validar-emision`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => response.data));
  }

  getConfiguracionEmision(idEmpresa: number): Observable<EmpresaConfiguracionResponse> {
    return this.http
      .get<ApiResponse<EmpresaConfiguracionResponse>>(`${this.baseUrl}/${idEmpresa}/configuracion-emision`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((response) => response.data));
  }

  private getAuthHeaders(): Record<string, string> {
    const xUserId = this.authService.getUserId() || '0';
    return {
      'x-user-id': String(xUserId),
    };
  }

  private getMultipartHeaders(): Record<string, string> {
    const xUserId = this.authService.getUserId() || '0';
    // Para FormData, no especificamos Content-Type
    // Angular lo manejará automáticamente
    return {
      'x-user-id': String(xUserId),
    };
  }

  private normalizeEmpresaResponse(empresa: EmpresaResponse): EmpresaResponse {
    return {
      ...empresa,
      estado: (typeof empresa.estado === 'string' ? empresa.estado.toUpperCase() : 'INACTIVO') as 'ACTIVO' | 'INACTIVO',
      ambienteEmision: (typeof empresa.ambienteEmision === 'string' ? empresa.ambienteEmision.toUpperCase() : 'BETA') as 'BETA' | 'PRODUCCION',
      proveedorEmision: (typeof empresa.proveedorEmision === 'string' ? empresa.proveedorEmision.toUpperCase() : 'SUNAT') as 'SUNAT' | 'OSE',
    };
  }

  private shouldFallbackToList(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse) || error.status !== 400) {
      return false;
    }

    const payload = error.error as { message?: unknown } | undefined;
    const message = typeof payload?.message === 'string' ? payload.message : '';

    return message.toLowerCase().includes('numeric string is expected');
  }

  private getEmpresaPrincipalFromListFallback(): Observable<EmpresaResponse> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1)
      .set('sortBy', 'createdAt')
      .set('sortDir', 'DESC');

    return this.http
      .get<{ data?: Array<{ idEmpresa?: number }> }>(`${this.baseUrl}`, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(
        map((response) => response.data?.[0]?.idEmpresa ?? null),
        switchMap((idEmpresa) => {
          if (!idEmpresa) {
            return throwError(
              () =>
                new HttpErrorResponse({
                  status: 404,
                  statusText: 'Not Found',
                  error: { message: 'No hay empresa principal registrada.' },
                }),
            );
          }

          return this.getById(idEmpresa);
        }),
      );
  }
}

