import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Ojo abierto — usado para "mostrar contraseña". */
@Component({
  selector: 'app-svg-ojo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 24s7.5-14 20-14 20 14 20 14-7.5 14-20 14S4 24 4 24Z"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="24" cy="24" r="6" stroke="currentColor" stroke-width="2.4" />
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
export class SvgOjo {}
