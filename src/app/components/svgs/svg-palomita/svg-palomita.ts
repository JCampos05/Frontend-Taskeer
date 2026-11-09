import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Palomita simple (sin círculo) — progreso de subtareas y marcas pequeñas en línea. */
@Component({
  selector: 'app-svg-palomita',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 25l9 9 18-20"
        stroke="currentColor"
        stroke-width="3"
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
export class SvgPalomita {}
