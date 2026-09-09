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

export interface LoginResultado {
  accessToken: string;
  user: Usuario;
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
