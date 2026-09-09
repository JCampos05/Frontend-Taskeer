export type ToastTipo = 'exito' | 'error' | 'advertencia' | 'info';

export interface ToastAccion {
  etiqueta: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  tipo: ToastTipo;
  titulo?: string;
  mensaje: string;
  accion?: ToastAccion;
}

export interface MostrarToastInput {
  titulo?: string;
  mensaje: string;
  accion?: ToastAccion;
  /** ms antes de auto-cerrarse. `0` deja el toast abierto hasta que el
   * usuario lo cierre a mano — default razonable si no se especifica: 5s,
   * o sin auto-cierre si trae `accion` (darle tiempo a hacer clic). */
  duracionMs?: number;
}
