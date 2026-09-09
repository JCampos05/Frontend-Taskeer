import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-svg-sol',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="8" stroke="currentColor" stroke-width="2.4" />
      <path
        d="M24 4v5M24 39v5M44 24h-5M9 24H4M37.6 10.4l-3.5 3.5M13.9 34.1l-3.5 3.5M37.6 37.6l-3.5-3.5M13.9 13.9l-3.5-3.5"
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
export class SvgSol {}
