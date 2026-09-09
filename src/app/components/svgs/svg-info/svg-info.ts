import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Círculo con "i" — usado en toasts informativos. */
@Component({
  selector: 'app-svg-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2.5" />
      <path d="M24 22v10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="24" cy="16" r="1.8" fill="currentColor" />
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
export class SvgInfo {}
