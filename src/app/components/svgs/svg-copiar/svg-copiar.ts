import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Dos rectángulos superpuestos — copiar al portapapeles. */
@Component({
  selector: 'app-svg-copiar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="17"
        y="17"
        width="24"
        height="24"
        rx="3"
        stroke="currentColor"
        stroke-width="2.4"
      />
      <path
        d="M31 17v-5a3 3 0 0 0-3-3H10a3 3 0 0 0-3 3v18a3 3 0 0 0 3 3h5"
        stroke="currentColor"
        stroke-width="2.4"
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
export class SvgCopiar {}
