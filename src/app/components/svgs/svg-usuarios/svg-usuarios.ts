import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Dos personas — usado en la feature de workspaces compartidos. */
@Component({
  selector: 'app-svg-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="16" r="5.5" stroke="currentColor" stroke-width="2.2" />
      <path
        d="M8 38v-2a10 10 0 0 1 20 0v2"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
      />
      <path
        d="M30 12a5.5 5.5 0 0 1 0 11"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        opacity="0.6"
      />
      <path
        d="M32 26a10 10 0 0 1 8 9.8"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        opacity="0.6"
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
export class SvgUsuarios {}
