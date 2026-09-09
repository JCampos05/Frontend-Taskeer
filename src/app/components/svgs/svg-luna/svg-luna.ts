import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-svg-luna',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M39 27.5A16 16 0 1 1 20.5 9a12.5 12.5 0 0 0 18.5 18.5Z"
        stroke="currentColor"
        stroke-width="2.4"
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
export class SvgLuna {}
