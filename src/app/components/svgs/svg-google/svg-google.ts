import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Logo de Google ("G" multicolor) — a diferencia del resto de
 * components/svgs/, usa los colores oficiales de marca en vez de
 * currentColor: el botón "Continuar con Google" debe mostrar el logo real,
 * no una versión monocromática que herede el color de marca de Taskeer. */
@Component({
  selector: 'app-svg-google',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#EA4335"
        d="M24 9.5c3.4 0 6.4 1.17 8.79 3.45l6.4-6.4C35.09 2.83 29.9.5 24 .5 14.62.5 6.51 5.88 2.56 13.72l7.46 5.79C12 13.79 17.5 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.64-.15-3.22-.42-4.74H24v9.02h12.65c-.55 2.88-2.2 5.32-4.7 6.96l7.28 5.65C43.78 37.7 46.5 31.63 46.5 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.02 19.51a13.98 13.98 0 0 0 0 8.98l-7.46 5.79A23.94 23.94 0 0 1 0 24.5c0-2.98.71-5.8 1.56-8.28z"
      />
      <path
        fill="#34A853"
        d="M24 48.5c6.48 0 11.93-2.13 15.9-5.79l-7.28-5.65c-2.15 1.45-4.96 2.44-8.62 2.44-6.5 0-12-4.29-13.98-10.99l-7.46 5.79C6.51 42.62 14.62 48.5 24 48.5z"
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
export class SvgGoogle {}
