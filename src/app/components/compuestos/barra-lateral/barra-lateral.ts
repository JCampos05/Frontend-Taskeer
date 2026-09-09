import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgCarpetas } from '../../svgs/svg-carpetas/svg-carpetas';
import { SvgCasa } from '../../svgs/svg-casa/svg-casa';
import { SvgFlechaDoble } from '../../svgs/svg-flecha-doble/svg-flecha-doble';
import { SvgLuna } from '../../svgs/svg-luna/svg-luna';
import { SvgSol } from '../../svgs/svg-sol/svg-sol';
import { MenuPerfil } from '../menu-perfil/menu-perfil';
import { PanelNotificaciones } from '../panel-notificaciones/panel-notificaciones';
import { PreferencesService } from '../../../services/preferences.service';
import { ThemeService } from '../../../services/theme.service';

const CLAVE_COLAPSADO = 'taskeer.sidebar-colapsado';

@Component({
  selector: 'app-barra-lateral',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    SvgCasa,
    SvgCarpetas,
    SvgFlechaDoble,
    SvgSol,
    SvgLuna,
    PanelNotificaciones,
    MenuPerfil,
  ],
  templateUrl: './barra-lateral.html',
  styleUrl: './barra-lateral.css',
  host: {
    '[class.colapsada]': 'colapsada()',
  },
})
export class BarraLateral {
  protected readonly themeService = inject(ThemeService);
  private readonly preferencesService = inject(PreferencesService);

  protected readonly colapsada = signal(this.leerColapsado());

  protected alternarColapso(): void {
    const valor = !this.colapsada();
    this.colapsada.set(valor);
    try {
      localStorage.setItem(CLAVE_COLAPSADO, String(valor));
    } catch {
      // no crítico
    }
  }

  protected alternarTema(): void {
    this.themeService.alternar();
    // Best-effort: si falla (sin red, etc.) el tema igual queda aplicado y
    // guardado en localStorage vía ThemeService — solo no queda
    // sincronizado con el backend hasta el próximo cambio exitoso.
    void this.preferencesService.actualizar({ theme: this.themeService.temaActual() as 'LIGHT' | 'DARK' });
  }

  private leerColapsado(): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
      return localStorage.getItem(CLAVE_COLAPSADO) === 'true';
    } catch {
      return false;
    }
  }
}
