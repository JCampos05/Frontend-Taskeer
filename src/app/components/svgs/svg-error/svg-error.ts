import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Círculo con X — usado en toasts de error. */
@Component({
  selector: 'app-svg-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2.5" />
      <path
        d="M18 18 30 30M30 18 18 30"
        stroke="currentColor"
        stroke-width="2.5"
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
export class SvgError {}
