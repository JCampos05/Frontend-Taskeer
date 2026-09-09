import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Columnas de un tablero kanban — usado en la feature de boards. */
@Component({
  selector: 'app-svg-tablero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="36" height="32" rx="4" stroke="currentColor" stroke-width="2.2" />
      <path d="M18 8v32" stroke="currentColor" stroke-width="2.2" />
      <path d="M30 8v32" stroke="currentColor" stroke-width="2.2" />
      <rect x="9.5" y="14" width="5" height="7" rx="1.3" fill="currentColor" opacity="0.85" />
      <rect x="9.5" y="24" width="5" height="5" rx="1.3" fill="currentColor" opacity="0.5" />
      <rect x="21.5" y="14" width="5" height="5" rx="1.3" fill="currentColor" opacity="0.5" />
      <rect x="21.5" y="22" width="5" height="8" rx="1.3" fill="currentColor" opacity="0.85" />
      <rect x="33.5" y="14" width="5" height="6" rx="1.3" fill="currentColor" opacity="0.85" />
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
export class SvgTablero {}
