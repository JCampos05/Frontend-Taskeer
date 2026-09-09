import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-svg-casa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 22 24 9l16 13"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12 19v18a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V19"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M19 39v-9h10v9" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" />
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
export class SvgCasa {}
