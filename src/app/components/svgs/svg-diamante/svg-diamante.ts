import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Diamante — usado para el nav de planes. */
@Component({
  selector: 'app-svg-diamante',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 8h20l8 11-18 21L6 19l8-11Z"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linejoin="round"
      />
      <path
        d="M6 19h36M18 8l6 11 6-11M24 19v21"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linejoin="round"
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
export class SvgDiamante {}
