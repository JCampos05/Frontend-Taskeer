import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Wifi tachado — usado en sin-conexión y en el banner global. */
@Component({
  selector: 'app-svg-sin-wifi',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 22a14 14 0 0 1 20 0"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        opacity="0.5"
      />
      <path
        d="M19 28a7 7 0 0 1 10 0"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        opacity="0.7"
      />
      <circle cx="24" cy="34" r="2" fill="currentColor" />
      <path d="M8 10 40 38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
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
export class SvgSinWifi {}
