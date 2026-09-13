import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Ojo tachado — usado para "ocultar contraseña" (estado activo del
 * toggle, cuando la contraseña ya está en texto plano). */
@Component({
  selector: 'app-svg-ojo-cerrado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.5 14.5C5.5 17.5 4 24 4 24s7.5 14 20 14c3 0 5.6-.6 7.9-1.6M39.5 33.5C42.5 30.5 44 24 44 24s-7.5-14-20-14c-1.5 0-2.9.15-4.2.42"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M19 20.3A6 6 0 0 0 24 30a6 6 0 0 0 4.7-2.3"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M6 6 42 42" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
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
export class SvgOjoCerrado {}
