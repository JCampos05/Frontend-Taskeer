import { WorkspaceRole } from '../models/workspace';

// Cascada de permisos Workspace → Board → Column → Task (ver
// docs/02-modelo-datos.md): OWNER/ADMIN gestionan boards y columnas,
// EDITOR+ gestiona tareas, VIEWER solo lee. Mismo criterio ya aplicado en
// Backend/src/modules/boards/boards.service.ts y tasks.service.ts —
// duplicado aquí a propósito (el Frontend no comparte código con el
// Backend) solo para ocultar acciones que igual rechazaría la API; nunca es
// la única barrera de seguridad.

export function puedeGestionarTableros(rol: WorkspaceRole | null): boolean {
  return rol === 'OWNER' || rol === 'ADMIN';
}

export function puedeGestionarTareas(rol: WorkspaceRole | null): boolean {
  return rol === 'OWNER' || rol === 'ADMIN' || rol === 'EDITOR';
}
