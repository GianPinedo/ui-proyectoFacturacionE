export type EmpresaEstado = 'ACTIVO' | 'INACTIVO';
export type EmpresaAmbienteEmision = 'BETA' | 'PRODUCCION';
export type EmpresaProveedorEmision = 'SUNAT' | 'OSE';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface EmpresaResponse {
  idEmpresa: number;
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  correo?: string;
  telefono?: string;
  logoUrl?: string;
  ambienteEmision: EmpresaAmbienteEmision;
  proveedorEmision: EmpresaProveedorEmision;
  endpointEnvio?: string;
  estado: EmpresaEstado;
  tieneCertificado: boolean;
  tieneCredenciales: boolean;
  listaParaEmitir: boolean;
}

export interface EmpresaCreateRequest {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  correo?: string;
  telefono?: string;
}

export interface EmpresaUpdateRequest {
  razonSocial: string;
  nombreComercial?: string;
  direccion: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  correo?: string;
  telefono?: string;
}

export interface EmpresaEstadoRequest {
  estado: EmpresaEstado;
}

export interface EmpresaAmbienteRequest {
  ambienteEmision: EmpresaAmbienteEmision;
}

export interface EmpresaProveedorRequest {
  proveedorEmision: EmpresaProveedorEmision;
  endpointEnvio?: string;
}

export interface EmpresaCredencialesRequest {
  usuarioSol: string;
  claveSol: string;
  confirmacionClaveSol: string;
}

export interface EmpresaValidacionEmisionResponse {
  listaParaEmitir: boolean;
  pendientes: string[];
}

export interface EmpresaConfiguracionResponse {
  idEmpresa: number;
  ambienteEmision: EmpresaAmbienteEmision;
  proveedorEmision: EmpresaProveedorEmision;
  endpointEnvio?: string;
  tieneCertificado: boolean;
  tieneCredenciales: boolean;
  empresaActiva: boolean;
  listaParaEmitir: boolean;
}

export interface CertificadoValidacionResponse {
  valido: boolean;
  fechaInicio?: string;
  fechaVencimiento?: string;
  mensaje: string;
}
