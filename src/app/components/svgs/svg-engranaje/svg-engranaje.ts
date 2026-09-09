import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-svg-engranaje',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="6.5" stroke="currentColor" stroke-width="2.4" />
      <path
        d="M24 6v5M24 37v5M42 24h-5M11 24H6M36.4 11.6l-3.5 3.5M15.1 32.9l-3.5 3.5M36.4 36.4l-3.5-3.5M15.1 15.1l-3.5-3.5"
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
export class SvgEngranaje {}
