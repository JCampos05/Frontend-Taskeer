import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Flecha saliendo de una puerta — usado para cerrar sesión. */
@Component({
  selector: 'app-svg-salir',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 8h-8a2 2 0 0 0-2 2v28a2 2 0 0 0 2 2h8"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M18 24h22m0 0-6-6m6 6-6 6"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
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
export class SvgSalir {}
