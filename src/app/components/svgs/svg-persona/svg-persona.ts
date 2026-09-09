import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Silueta de una persona — usado en "Mi Perfil". */
@Component({
  selector: 'app-svg-persona',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="16" r="7" stroke="currentColor" stroke-width="2.4" />
      <path
        d="M10 39v-2a14 14 0 0 1 28 0v2"
        stroke="currentColor"
        stroke-width="2.4"
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
export class SvgPersona {}
