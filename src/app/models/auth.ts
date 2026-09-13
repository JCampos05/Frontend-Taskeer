import { Usuario } from './usuario';

// Espejos de los DTOs de Backend/src/modules/auth/auth.types.ts.

export interface RegistroInput {
  email: string;
  password: string;
  displayName: string;
}

export interface RegistroResultado {
  user: Usuario;
  emailVerificationToken?: string;
  // Los 10 códigos de recuperación en texto plano — se muestran UNA sola
  // vez, aquí, justo después del registro (ver
  // docs/03-autenticacion-seguridad.md).
  recoveryCodes: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RestablecerContrasenaInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface CambiarContrasenaInput {
  currentPassword: string;
  newPassword: string;
}

export interface RegenerarCodigosInput {
  currentPassword: string;
}

export interface RecoveryCodesResultado {
  recoveryCodes: string[];
}

export interface LoginResultado {
  accessToken: string;
  user: Usuario;
}

export interface GoogleLoginResultado {
  accessToken: string;
  user: Usuario;
  // Solo presente si este login creó una cuenta nueva — igual que
  // RegistroResultado.recoveryCodes, se muestran una sola vez.
  recoveryCodes?: string[];
}

export interface ResendVerificationResultado {
  alreadyVerified: boolean;
  // Solo presente en desarrollo — mismo criterio que
  // RegistroResultado.emailVerificationToken.
  emailVerificationToken?: string;
}

export interface ErrorApi {
  error: {
    code: string;
    message: string;
  };
}
