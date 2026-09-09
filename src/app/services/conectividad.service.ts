import { Injectable, signal } from '@angular/core';

/**
 * Detecta conectividad de red del navegador (evento online/offline) para
 * mostrar el banner global de "sin conexión" — ver
 * components/secundarios/banner-sin-conexion/.
 *
 * `navigator.onLine` solo detecta si hay una interfaz de red activa, no si
 * hay salida real a internet (ej. wifi conectado a un router sin internet
 * sigue reportando true) — es una señal aproximada, suficiente para avisar
 * al usuario, no para bloquear peticiones.
 */
@Injectable({ providedIn: 'root' })
export class ConectividadService {
  private readonly enLinea = signal(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  readonly estaEnLinea = this.enLinea.asReadonly();

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => this.enLinea.set(true));
    window.addEventListener('offline', () => this.enLinea.set(false));
  }
}
