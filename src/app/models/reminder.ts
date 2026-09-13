// Espejo de UpcomingReminderDto (Backend/src/modules/reminders/reminders.types.ts).
export interface RecordatorioProximo {
  id: string;
  remindAt: string;
  task: { id: string; title: string };
  board: { id: string; name: string };
  workspaceId: string;
}
