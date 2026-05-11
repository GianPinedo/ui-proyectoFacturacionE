export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  status?: string;
  code?: number;
  message?: string;
  data?: LoginResponseData;
}

export interface LoginResponseData {
  token?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: string | number;
  usuario?: AuthUser;
  user?: AuthUser;
  accessToken?: string;
}

export interface AuthUser {
  idUsuario?: string | number;
  idRol?: number;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  username?: string;
  rol?: string;
  estado?: string;
  createdAt?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: string | number;
  user?: AuthUser;
}
