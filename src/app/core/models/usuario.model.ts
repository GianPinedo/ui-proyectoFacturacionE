export interface UpdateUsuarioPayload {
  idRol: number;
  nombres: string;
  apellidos: string;
  correo: string;
}

export interface UpdateUsuarioResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
}

export interface ChangePasswordPayload {
  passwordActual: string;
  passwordNuevo: string;
}

export interface ChangePasswordResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
}

export interface UsuarioListItem {
  idUsuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  username: string;
  rol: string;
  estado: string;
  createdAt: string;
}

export interface UsuariosListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsuariosListResponse {
  status?: string;
  code?: number;
  message?: string;
  data: UsuarioListItem[];
  meta: UsuariosListMeta;
}

export interface UsuariosListParams {
  page: number;
  size: number;
  buscar?: string;
  rol?: string;
}
