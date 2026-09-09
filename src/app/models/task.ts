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
}

export interface ActualizarTaskInput {
  title?: string;
  description?: string | null;
  dueAt?: string | null;
  assigneeId?: string | null;
}

export interface MoverTaskInput {
  columnId: string;
  position: number;
}
