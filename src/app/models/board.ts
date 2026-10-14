// Espejos de los DTOs de Backend/src/modules/boards/boards.types.ts. El
// Backend no comparte paquete de tipos con el Frontend por ahora (decisión
// explícita, ver CLAUDE.md).

import type { PrioridadTarea } from './task';
import type { WorkspaceRole } from './workspace';

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Columna {
  id: string;
  boardId: string;
  name: string;
  position: number;
  // null = sin límite de tareas simultáneas en esta columna.
  wipLimit: number | null;
  // true = las tareas de esta columna cuentan como terminadas — "Mi día"
  // las excluye de lo pendiente. Un board puede tener más de una marcada así.
  isDoneColumn: boolean;
  createdAt: string;
  updatedAt: string;
}

// Resumen de tarea embebido en el detalle de un board — no trae todos los
// campos del TaskDto completo (ver models/task.ts), solo lo necesario para
// renderizar la tarjeta en el kanban.
export interface TaskResumen {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  priority: PrioridadTarea;
  position: number;
  assigneeId: string | null;
  subtaskTotal: number;
  subtaskCompletado: number;
  // Si el usuario actual ya la agregó a su "Mi día" — personal, nunca la
  // marca de otro miembro del workspace.
  inMyDay: boolean;
}

export interface ColumnaConTareas extends Columna {
  tasks: TaskResumen[];
}

export interface BoardDetalle extends Board {
  // Rol EFECTIVO del usuario actual en ESTE board — ya resuelto contra un
  // posible BoardMemberOverride por el Backend. Usar esto (no el rol de
  // workspace del usuario) para decidir qué botones mostrar en el tablero.
  viewerEffectiveRole: WorkspaceRole;
  columns: ColumnaConTareas[];
}

export interface CrearBoardInput {
  name: string;
}

export interface ActualizarBoardInput {
  name?: string;
  slug?: string;
}

export interface CrearColumnaInput {
  name: string;
  wipLimit?: number | null;
  isDoneColumn?: boolean;
}

export interface ActualizarColumnaInput {
  name?: string;
  position?: number;
  wipLimit?: number | null;
  isDoneColumn?: boolean;
}

// Espejo de BoardMemberOverrideDto — rol EFECTIVO de un miembro dentro de
// ESTE board puntual, mientras exista esta fila reemplaza (no combina) su
// rol de workspace, en cualquier dirección. Solo lo gestiona el OWNER/ADMIN
// del workspace (ver docs/02-modelo-datos.md).
export interface BoardMemberOverride {
  id: string;
  boardId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
}
