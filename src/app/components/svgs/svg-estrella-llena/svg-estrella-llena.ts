import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Estrella rellena — tarea ya marcada en "Mi día". Ver también SvgEstrella. */
@Component({
  selector: 'app-svg-estrella-llena',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 8l4.9 10.3 11.1 1.6-8 8 1.9 11.4L24 34l-9.9 5.3L16 27.9l-8-8 11.1-1.6L24 8Z" />
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
export class SvgEstrellaLlena {}
