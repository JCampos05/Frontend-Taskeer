// Espejo de PublicUserDto (Backend/src/modules/auth/auth.types.ts). Backend
// y Frontend no comparten paquete de tipos por ahora — decisión explícita
// documentada en CLAUDE.md.
export interface Usuario {
  id: string;
  email: string;
  displayName: string;
  emailVerifiedAt: string | null;
  // false para cuentas creadas con Google que nunca agregaron una
  // contraseña local — la UI de configuración lo usa para decidir si
  // mostrar "cambiar contraseña"/"regenerar códigos de recuperación".
  hasPassword: boolean;
}
