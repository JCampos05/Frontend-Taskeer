import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Flecha saliendo de una carpeta — mover un elemento a otro lugar. */
@Component({
  selector: 'app-svg-mover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 14a2 2 0 0 1 2-2h9l4 5h19a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V14Z"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linejoin="round"
      />
      <path
        d="M17 27h14m-5-5 5 5-5 5"
        stroke="currentColor"
        stroke-width="2.4"
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
export class SvgMover {}
