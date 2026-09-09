import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Lupa — usado en la página 404 (no encontrado). */
@Component({
  selector: 'app-svg-lupa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="21"
        cy="21"
        r="13"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <path
        d="M30.5 30.5 L41 41"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <path
        d="M16 21a5 5 0 0 1 5-5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        opacity="0.5"
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
export class SvgLupa {}
