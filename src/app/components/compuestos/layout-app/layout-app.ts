import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraLateral } from '../barra-lateral/barra-lateral';
import { NotificationsService } from '../../../services/notifications.service';
import { PreferencesService } from '../../../services/preferences.service';
import { ThemeService } from '../../../services/theme.service';
import { NotificationsStreamService } from '../../../services/notifications-stream.service';

/** Shell de la app autenticada — sidebar + área de contenido. Envuelve
 * todas las rutas bajo /app (ver app.routes.ts). */
@Component({
  selector: 'app-layout-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, BarraLateral],
  templateUrl: './layout-app.html',
  styleUrl: './layout-app.css',
})
export class LayoutApp {
  private readonly preferencesService = inject(PreferencesService);
  private readonly themeService = inject(ThemeService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly notificationsStreamService = inject(NotificationsStreamService);

  constructor() {
    // Sincroniza el tema con UserPreferences del backend al entrar a la
    // app autenticada — si el usuario nunca guardó nada (isPersisted:
    // false), se queda con lo que ya había en localStorage/AUTO en vez de
    // sobreescribirlo con el default del backend.
    void this.preferencesService.cargar().then((preferences) => {
      if (preferences.isPersisted) {
        this.themeService.establecerTema(preferences.theme);
      }
    });

    void this.notificationsService.cargar();
    void this.notificationsStreamService.conectar();
  }
}
