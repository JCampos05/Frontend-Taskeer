import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Signo "+" — usado en botones de agregar (columna, tarea, tablero). */
@Component({
  selector: 'app-svg-mas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 10v28M10 24h28" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" />
    </svg>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class SvgMas {}
