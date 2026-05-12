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

export interface UpdateUsuarioEstadoPayload {
  estado: 'ACTIVO' | 'INACTIVO';
  motivo: string;
}

export interface UpdateUsuarioEstadoResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
}

export interface ResetUsuarioPasswordPayload {
  passwordNuevo: string;
}

export interface ResetUsuarioPasswordResponse {
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

export interface UsuarioDetailResponse {
  status?: string;
  code?: number;
  message?: string;
  data: UsuarioListItem;
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

export interface RolDetailResponse {
  status?: string;
  code?: number;
  message?: string;
  data: RolListItem;
}

export interface CreateRolPayload {
  nombre: string;
  descripcion: string;
  modulosIds: number[];
  permisoLectura: boolean;
  permisoCreacion: boolean;
  permisoActualizacion: boolean;
  permisoBorracion: boolean;
}

export interface CreateRolResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
}

export interface UpdateRolPayload {
  nombre: string;
  descripcion: string;
}

export interface UpdateRolResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
}

export interface UpdateRolEstadoPayload {
  estado: 'ACTIVO' | 'INACTIVO';
  motivo: string;
}

export interface UpdateRolEstadoResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
}

export interface ModuloListItem {
  idModulo: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  orden: number;
  estado: string;
  idModuloPadre?: string | null;
  hijos?: ModuloListItem[];
}

export interface ModulosListParams {
  page: number;
  size: number;
  estado?: string;
}

export interface ModulosListResponse {
  status?: string;
  code?: number;
  message?: string;
  data: ModuloListItem[];
  meta: UsuariosListMeta;
}

export interface AsignarModulosRolPayload {
  idRol: number;
  modulosIds: number[];
  permisoLectura: boolean;
  permisoCreacion: boolean;
  permisoActualizacion: boolean;
  permisoBorracion: boolean;
}

export interface AsignarModulosRolResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: Record<string, unknown>;
}

export interface ModuloPermisoRolItem {
  idModulo: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  orden: number;
  permisoLectura: boolean;
  permisoCreacion: boolean;
  permisoActualizacion: boolean;
  permisoBorracion: boolean;
  estado: string;
}

export interface ModulosPermisosRolResponse {
  status?: string;
  code?: number;
  message?: string;
  data: ModuloPermisoRolItem[];
}
