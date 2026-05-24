import { UsuariosListMeta } from './usuario.model';

export interface SerieComprobantePayload {
  tipoComprobante: string;
  serie: string;
  correlativoActual: number;
  descripcion?: string;
}

export interface SerieComprobanteListItem {
  idSerie: number;
  tipoComprobante: string;
  serie: string;
  correlativoActual: number;
  descripcion: string | null;
  estado: boolean;
  estadoTexto: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface SerieComprobanteResponse {
  status?: string;
  code?: number;
  message?: string;
  data: SerieComprobanteListItem;
}

export interface SeriesComprobanteListParams {
  page: number;
  size: number;
  tipoComprobante?: string;
  serie?: string;
  estado?: 'ACTIVO' | 'INACTIVO' | '';
}

export interface SeriesComprobanteListResponse {
  status?: string;
  code?: number;
  message?: string;
  data: SerieComprobanteListItem[];
  meta: UsuariosListMeta;
}

export interface UpdateSerieComprobanteEstadoPayload {
  estado: 'ACTIVO' | 'INACTIVO';
  motivo?: string;
}

