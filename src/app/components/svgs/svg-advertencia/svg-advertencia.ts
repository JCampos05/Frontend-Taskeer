import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Triángulo de advertencia — usado en la página 500 (error inesperado). */
@Component({
  selector: 'app-svg-advertencia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 8 43 39H5L24 8Z"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      <path d="M24 21v8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="24" cy="33" r="1.8" fill="currentColor" />
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
export class SvgAdvertencia {}
