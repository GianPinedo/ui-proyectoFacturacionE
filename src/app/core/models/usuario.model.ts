export interface UpdateUsuarioPayload {
  idRol: number;
  nombres: string;
  apellidos: string;
  correo: string;
}

export interface CreateUsuarioPayload {
  idRol: number;
  nombres: string;
  apellidos: string;
  correo: string;
  username: string;
  password: string;
}

export interface UpdateUsuarioResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
}

export interface CreateUsuarioResponse {
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

export interface RolListItem {
  idRol: string;
  nombre: string;
  descripcion: string;
  estado: string;
  createdAt: string;
}

export interface RolesListParams {
  page: number;
  size: number;
  nombre?: string;
  estado?: string;
}

export interface RolesListResponse {
  status?: string;
  code?: number;
  message?: string;
  data: RolListItem[];
  meta: UsuariosListMeta;
}
