// Espejos de los DTOs de Backend/src/modules/boards/boards.types.ts. El
// Backend no comparte paquete de tipos con el Frontend por ahora (decisión
// explícita, ver CLAUDE.md).

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
  position: number;
  assigneeId: string | null;
}

export interface ColumnaConTareas extends Columna {
  tasks: TaskResumen[];
}

export interface BoardDetalle extends Board {
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
}

export interface ActualizarColumnaInput {
  name?: string;
  position?: number;
}
