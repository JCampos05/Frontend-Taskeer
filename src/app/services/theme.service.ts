import { Injectable, effect, signal } from '@angular/core';

export type Tema = 'LIGHT' | 'DARK' | 'AUTO';

const CLAVE_ALMACENAMIENTO = 'taskeer.tema';

/**
 * Controla el atributo `[data-theme]` en `<html>` que ya consume
 * `app/styles/theme.css`. `AUTO` no fija el atributo — deja que
 * `prefers-color-scheme` decida, igual que espera el CSS.
 *
 * Persistencia: por ahora solo en `localStorage` (conveniencia del
 * navegador, no es la fuente de verdad). Cuando exista el endpoint de
 * `UserPreferences` en el backend (ver docs/02-modelo-datos.md), este
 * service debe sincronizar contra eso en vez de/además de localStorage —
 * queda como TODO explícito, no bloqueante para tener el toggle
 * funcionando ya.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly tema = signal<Tema>(this.leerAlmacenamiento());

  readonly temaActual = this.tema.asReadonly();

  constructor() {
    effect(() => {
      const valor = this.tema();
      if (typeof document === 'undefined') return;

      if (valor === 'AUTO') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', valor.toLowerCase());
      }

      try {
        localStorage.setItem(CLAVE_ALMACENAMIENTO, valor);
      } catch {
        // Modo privado / almacenamiento bloqueado — no es crítico, el
        // tema sigue funcionando para esta sesión, solo no persiste.
      }
    });
  }

  establecerTema(tema: Tema): void {
    this.tema.set(tema);
  }

  alternar(): void {
    // Alterna entre claro/oscuro directo — si estaba en AUTO, arranca
    // desde el opuesto de lo que el sistema esté mostrando ahora mismo.
    const actual = this.tema();
    const esOscuroAhora =
      actual === 'DARK' ||
      (actual === 'AUTO' &&
        typeof matchMedia !== 'undefined' &&
        matchMedia('(prefers-color-scheme: dark)').matches);

    this.tema.set(esOscuroAhora ? 'LIGHT' : 'DARK');
  }

  private leerAlmacenamiento(): Tema {
    if (typeof localStorage === 'undefined') return 'AUTO';
    try {
      const valor = localStorage.getItem(CLAVE_ALMACENAMIENTO);
      return valor === 'LIGHT' || valor === 'DARK' || valor === 'AUTO' ? valor : 'AUTO';
    } catch {
      return 'AUTO';
    }
  }
}
