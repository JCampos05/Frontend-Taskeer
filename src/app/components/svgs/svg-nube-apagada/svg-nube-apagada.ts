import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Nube tachada — usado en servicio-no-disponible (API caída). */
@Component({
  selector: 'app-svg-nube-apagada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 33a8 8 0 0 1-1-15.9A10 10 0 0 1 33 15a7 7 0 0 1 1 13.9"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8 8 40 40"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        opacity="0.7"
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
export class SvgNubeApagada {}
