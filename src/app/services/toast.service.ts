import { Injectable, signal } from '@angular/core';
import { MostrarToastInput, Toast, ToastTipo } from '../models/toast';

const DURACION_DEFAULT_MS = 5000;

/**
 * Sistema de toasts global de Taskeer — un signal con la lista de toasts
 * activos, renderizado por `components/secundarios/toast-contenedor/`
 * (montado una sola vez en app.html, disponible en toda la app). Además de
 * los 4 estados fijos (`exito`/`error`/`advertencia`/`info`), soporta
 * toasts "personalizados" vía `mostrar()` con título/acción propios — los
 * 4 atajos (`exito()`, etc.) son solo azúcar sobre eso.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toasts = signal<Toast[]>([]);

  readonly toastsActivos = this.toasts.asReadonly();

  mostrar(tipo: ToastTipo, input: MostrarToastInput): string {
    const id = crypto.randomUUID();
    const toast: Toast = { id, tipo, ...input };

    this.toasts.update((lista) => [...lista, toast]);

    const duracion = input.duracionMs ?? (input.accion ? 0 : DURACION_DEFAULT_MS);
    if (duracion > 0) {
      setTimeout(() => this.cerrar(id), duracion);
    }

    return id;
  }

  cerrar(id: string): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  exito(mensaje: string, opciones?: Omit<MostrarToastInput, 'mensaje'>): string {
    return this.mostrar('exito', { mensaje, ...opciones });
  }

  error(mensaje: string, opciones?: Omit<MostrarToastInput, 'mensaje'>): string {
    return this.mostrar('error', { mensaje, ...opciones });
  }

  advertencia(mensaje: string, opciones?: Omit<MostrarToastInput, 'mensaje'>): string {
    return this.mostrar('advertencia', { mensaje, ...opciones });
  }

  info(mensaje: string, opciones?: Omit<MostrarToastInput, 'mensaje'>): string {
    return this.mostrar('info', { mensaje, ...opciones });
  }
}
