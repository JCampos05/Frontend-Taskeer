import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Flecha hacia la derecha — enlaces de "ver más"; con rotate(180deg) sirve de "volver". */
@Component({
  selector: 'app-svg-flecha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 24h28M27 13l11 11-11 11"
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
export class SvgFlecha {}
