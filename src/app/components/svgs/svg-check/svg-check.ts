import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Círculo con check — confirmaciones de éxito (verificación de correo, etc.). */
@Component({
  selector: 'app-svg-check',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2.5" />
      <path
        d="M17 24.5 22 29.5 32 18.5"
        stroke="currentColor"
        stroke-width="2.5"
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
export class SvgCheck {}
