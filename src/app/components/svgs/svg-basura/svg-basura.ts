import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Papelera — usado para borrar notificaciones. */
@Component({
  selector: 'app-svg-basura',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 14h30M19 14V9.5A1.5 1.5 0 0 1 20.5 8h7a1.5 1.5 0 0 1 1.5 1.5V14"
        stroke="currentColor"
        stroke-width="2.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12.5 14 14 38.5A2 2 0 0 0 16 40.5h16a2 2 0 0 0 2-1.5L35.5 14"
        stroke="currentColor"
        stroke-width="2.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M20 20.5v13M28 20.5v13" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" />
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
export class SvgBasura {}
