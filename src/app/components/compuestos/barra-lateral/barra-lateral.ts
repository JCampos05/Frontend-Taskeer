import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgCarpetas } from '../../svgs/svg-carpetas/svg-carpetas';
import { SvgCasa } from '../../svgs/svg-casa/svg-casa';
import { SvgEstrellaLlena } from '../../svgs/svg-estrella-llena/svg-estrella-llena';
import { SvgFlechaDoble } from '../../svgs/svg-flecha-doble/svg-flecha-doble';
import { SvgLuna } from '../../svgs/svg-luna/svg-luna';
import { SvgSol } from '../../svgs/svg-sol/svg-sol';
import { ChipPlan } from '../chip-plan/chip-plan';
import { MenuPerfil } from '../menu-perfil/menu-perfil';
import { PanelNotificaciones } from '../panel-notificaciones/panel-notificaciones';
import { PreferencesService } from '../../../services/preferences.service';
import { ThemeService } from '../../../services/theme.service';
import { WorkspacesService } from '../../../services/workspaces.service';

const CLAVE_COLAPSADO = 'taskeer.sidebar-colapsado';

@Component({
  selector: 'app-barra-lateral',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    SvgCasa,
    SvgCarpetas,
    SvgEstrellaLlena,
    SvgFlechaDoble,
    SvgSol,
    SvgLuna,
    PanelNotificaciones,
    ChipPlan,
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
  private readonly workspacesService = inject(WorkspacesService);

  /** Accesos rápidos a los workspaces del usuario (máx. 8 para no desbordar
   * el sidebar; la lista completa vive en /app/workspaces). */
  protected readonly workspaces = computed(() =>
    this.workspacesService.workspacesConocidos().slice(0, 8),
  );

  protected readonly colapsada = signal(this.leerColapsado());

  constructor() {
    // Best-effort: si falla, el sidebar simplemente no muestra accesos
    // rápidos; la vista de Workspaces sigue funcionando por su cuenta.
    void this.workspacesService.listar().catch(() => undefined);
  }

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
