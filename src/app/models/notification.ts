// Espejo de NotificationDto (Backend/src/modules/notifications/notifications.types.ts).
export type NotificationTipo =
  | 'REMINDER'
  | 'INVITATION'
  | 'ROLE_CHANGED'
  | 'MENTION'
  | 'RECOVERY_CODE_USED'
  | 'TASK_ASSIGNED';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationTipo;
  title: string;
  body: string | null;
  taskId: string | null;
  readAt: string | null;
  createdAt: string;
}
