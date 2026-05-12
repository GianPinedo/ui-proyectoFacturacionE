import { UsuariosListMeta } from './usuario.model';

export interface EmpresaPayload {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion: string;
  ubigeo?: string;
  correo?: string;
  telefono?: string;
}

export interface EmpresaListItem {
  idEmpresa: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
  direccion: string;
  ubigeo: string | null;
  correo: string | null;
  telefono: string | null;
  logoUrl: string | null;
  estado: boolean;
  estadoTexto: string;
  createdAt: string;
}

export interface EmpresaResponse {
  status?: string;
  code?: number;
  message?: string;
  data: EmpresaListItem;
}

export interface EmpresasListParams {
  page: number;
  size: number;
  ruc?: string;
  razonSocial?: string;
  estado?: 'ACTIVO' | 'INACTIVO' | '';
}

export interface EmpresasListResponse {
  status?: string;
  code?: number;
  message?: string;
  data: EmpresaListItem[];
  meta: UsuariosListMeta;
}

export interface UpdateEmpresaEstadoPayload {
  estado: 'ACTIVO' | 'INACTIVO';
}
