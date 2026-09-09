import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Chevron simple (apunta arriba) — usado en el disparador del menú de perfil. */
@Component({
  selector: 'app-svg-chevron',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 28 24 18l10 10"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
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
export class SvgChevron {}
