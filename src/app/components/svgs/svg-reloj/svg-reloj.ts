import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Reloj — usado en sesión-expirada. */
@Component({
  selector: 'app-svg-reloj',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="25" r="15" stroke="currentColor" stroke-width="2.5" />
      <path
        d="M24 16v9l6 5"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M18 6h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
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
export class SvgReloj {}
