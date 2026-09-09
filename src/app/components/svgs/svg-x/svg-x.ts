import { ChangeDetectionStrategy, Component } from '@angular/core';

/** X simple, sin círculo — usado para cerrar modales (distinto de
 * svg-error, que sí lleva círculo y está pensado para estados de error). */
@Component({
  selector: 'app-svg-x',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 13 35 35M35 13 13 35"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
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
export class SvgX {}
