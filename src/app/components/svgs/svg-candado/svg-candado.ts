import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Candado cerrado — usado en la página 403 (sin permiso). */
@Component({
  selector: 'app-svg-candado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="11"
        y="21"
        width="26"
        height="19"
        rx="3"
        stroke="currentColor"
        stroke-width="2.5"
      />
      <path
        d="M17 21v-6a7 7 0 0 1 14 0v6"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <circle cx="24" cy="29" r="2.5" fill="currentColor" />
      <path d="M24 31.5V35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
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
export class SvgCandado {}
