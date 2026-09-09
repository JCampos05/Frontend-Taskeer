import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Lápiz — usado en acciones de editar/renombrar. */
@Component({
  selector: 'app-svg-lapiz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30.5 9.5 38.5 17.5 17 39H9v-8L30.5 9.5Z"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M26.5 13.5 34.5 21.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
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
export class SvgLapiz {}
