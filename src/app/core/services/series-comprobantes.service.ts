import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SerieComprobantePayload,
  SerieComprobanteResponse,
  SeriesComprobanteListParams,
  SeriesComprobanteListResponse,
  UpdateSerieComprobanteEstadoPayload,
} from '../models/serie-comprobante.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SeriesComprobantesService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getSeries(params: SeriesComprobanteListParams): Observable<SeriesComprobanteListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size)
      .set('sortBy', 'createdAt')
      .set('sortDir', 'DESC');

    if (params.tipoComprobante?.trim()) {
      httpParams = httpParams.set('tipoComprobante', params.tipoComprobante.trim());
    }

    if (params.serie?.trim()) {
      httpParams = httpParams.set('serie', params.serie.trim());
    }

    if (params.estado?.trim()) {
      httpParams = httpParams.set('estado', params.estado.trim());
    }

    return this.http.get<SeriesComprobanteListResponse>(`${environment.apiBaseUrl}/series-comprobantes`, {
      params: httpParams,
    });
  }

  getSerieById(idSerie: string): Observable<SerieComprobanteResponse> {
    return this.http.get<SerieComprobanteResponse>(`${environment.apiBaseUrl}/series-comprobantes/${idSerie}`);
  }

  createSerie(payload: SerieComprobantePayload): Observable<SerieComprobanteResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.post<SerieComprobanteResponse>(`${environment.apiBaseUrl}/series-comprobantes`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  updateSerie(idSerie: string, payload: SerieComprobantePayload): Observable<SerieComprobanteResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.put<SerieComprobanteResponse>(`${environment.apiBaseUrl}/series-comprobantes/${idSerie}`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  updateSerieEstado(idSerie: string, payload: UpdateSerieComprobanteEstadoPayload): Observable<SerieComprobanteResponse> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.patch<SerieComprobanteResponse>(`${environment.apiBaseUrl}/series-comprobantes/${idSerie}/estado`, payload, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }

  deleteSerie(idSerie: string): Observable<void> {
    const xUserId = this.authService.getUserId() || '0';

    return this.http.delete<void>(`${environment.apiBaseUrl}/series-comprobantes/${idSerie}`, {
      headers: {
        'x-user-id': String(xUserId),
      },
    });
  }
}

