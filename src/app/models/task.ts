// Espejo de TaskPriority (Backend/src/modules/tasks/tasks.types.ts). Existía
// en una versión alpha anterior de Taskeer — se reintroduce en vez de la
// idea de swimlanes que se había planteado.
export type PrioridadTarea = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Espejo de TaskDto (Backend/src/modules/tasks/tasks.types.ts).
export interface Task {
  id: string;
  columnId: string;
  assigneeId: string | null;
  title: string;
  description: string | null;
  // Siempre UTC tal cual llega del backend — la conversión a hora local es
  // responsabilidad del frontend (ver utils/fecha.ts y CLAUDE.md).
  dueAt: string | null;
  priority: PrioridadTarea;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CrearTaskInput {
  columnId: string;
  title: string;
  description?: string;
  dueAt?: string;
  assigneeId?: string;
  priority?: PrioridadTarea;
}

export interface ActualizarTaskInput {
  title?: string;
  description?: string | null;
  dueAt?: string | null;
  assigneeId?: string | null;
  priority?: PrioridadTarea;
}

export interface MoverTaskInput {
  columnId: string;
  position: number;
}

// Espejo de SubtaskDto (Backend/src/modules/tasks/tasks.types.ts) — un
// paso/checklist dentro de una Task. Independiente de en qué columna esté
// la tarea: marcarlo completado no bloquea ni exige nada sobre el estado
// de la tarea dueña.
export interface Subtask {
  id: string;
  taskId: string;
  assigneeId: string | null;
  title: string;
  dueAt: string | null;
  completed: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CrearSubtaskInput {
  title: string;
  dueAt?: string;
  assigneeId?: string;
}

export interface ActualizarSubtaskInput {
  title?: string;
  dueAt?: string | null;
  assigneeId?: string | null;
  completed?: boolean;
  position?: number;
}
