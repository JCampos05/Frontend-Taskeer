import { RecordatorioProximo } from './reminder';
import { Task } from './task';
import { MiInvitacion } from './workspace';

// Espejo de MyDayTaskDto (Backend/src/modules/tasks/tasks.types.ts) — tarea
// que el propio usuario marcó a mano en su "Mi día".
export interface TareaEnMiDia {
  addedAt: string;
  task: Task;
  board: { id: string; name: string };
  workspaceId: string;
}

// Espejo de AssignedTaskDto — tarea asignada automáticamente (por tener
// dueAt), con el tablero ya resuelto.
export interface TareaAsignadaConFecha {
  task: Task;
  board: { id: string; name: string };
  workspaceId: string;
}

// Espejo de MyDayDto (Backend/src/modules/my-day/my-day.types.ts).
export interface MiDia {
  pinnedTasks: TareaEnMiDia[];
  assignedTasks: TareaAsignadaConFecha[];
  reminders: RecordatorioProximo[];
  invitations: MiInvitacion[];
}
