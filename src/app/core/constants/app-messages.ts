export class AppMessages {
  private constructor() {}

  static readonly GENERIC_LOAD_ERROR = 'No se pudo cargar la información solicitada.';
  static readonly GENERIC_SAVE_ERROR = 'No se pudo guardar la información.';
  static readonly GENERIC_UPDATE_ERROR = 'No se pudo actualizar la información.';
  static readonly GENERIC_STATUS_UPDATE_ERROR = 'No se pudo actualizar el estado.';
  static readonly GENERIC_PASSWORD_RESET_ERROR = 'No se pudo restablecer la contraseña.';

  static readonly USER_CREATE_SUCCESS = 'El usuario fue registrado correctamente.';
  static readonly USER_UPDATE_SUCCESS = 'Los cambios se guardaron correctamente.';
  static readonly USER_STATUS_DISABLED_SUCCESS = 'El usuario fue desactivado correctamente.';
  static readonly USER_STATUS_ENABLED_SUCCESS = 'El usuario fue activado correctamente.';
  static readonly USER_PASSWORD_RESET_SUCCESS = 'La contraseña fue restablecida correctamente.';

  static readonly ROL_CREATE_SUCCESS = 'El rol fue registrado correctamente.';
  static readonly ROL_UPDATE_SUCCESS = 'El rol fue actualizado correctamente.';
  static readonly ROL_STATUS_DISABLED_SUCCESS = 'El rol fue desactivado correctamente.';
  static readonly ROL_STATUS_ENABLED_SUCCESS = 'El rol fue activado correctamente.';

  static readonly USER_STATE_REASON_REQUIRED = 'El motivo es obligatorio.';
  static readonly USER_PASSWORD_REQUIRED = 'La contraseña temporal es obligatoria.';
}
