import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Campana de notificación — usada en la feature de recordatorios. */
@Component({
  selector: 'app-svg-campana',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 8a10 10 0 0 0-10 10v6l-3 6h26l-3-6v-6A10 10 0 0 0 24 8Z"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linejoin="round"
      />
      <path
        d="M20 34a4 4 0 0 0 8 0"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
      />
      <circle cx="33" cy="13" r="4" fill="currentColor" />
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
export class SvgCampana {}
