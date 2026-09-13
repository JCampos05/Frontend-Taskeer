import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Logo de Taskeer (marca del producto) — a diferencia del resto de
 * components/svgs/, usa el azul de marca fijo en vez de currentColor: es
 * una identidad visual propia, no un ícono que deba heredar el color de
 * texto de donde se use (mismo criterio que svg-google). */
@Component({
  selector: 'app-svg-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" rx="32" ry="32" fill="#274690" />

      <circle cx="42" cy="38" r="8" fill="#ffffff" opacity="0.4" />
      <circle cx="100" cy="38" r="8" fill="#ffffff" opacity="0.4" />
      <circle cx="158" cy="38" r="8" fill="#ffffff" opacity="0.4" />

      <rect x="25" y="65" width="42" height="115" rx="8" ry="8" fill="#ffffff" />
      <circle cx="46" cy="122" r="10" fill="#274690" />

      <rect x="79" y="65" width="42" height="115" rx="8" ry="8" fill="#ffffff" />
      <rect x="87" y="118" width="26" height="8" rx="4" ry="4" fill="#274690" />

      <rect x="133" y="65" width="42" height="115" rx="8" ry="8" fill="#ffffff" />
      <path
        d="M 143 120 L 151 130 L 165 110"
        stroke="#274690"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
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
export class SvgLogo {}
