import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgCampana } from '../../components/svgs/svg-campana/svg-campana';
import { SvgCarpetas } from '../../components/svgs/svg-carpetas/svg-carpetas';
import { SvgUsuarios } from '../../components/svgs/svg-usuarios/svg-usuarios';
import { ErrorApi } from '../../models/auth';
import { RecordatorioProximo } from '../../models/reminder';
import { MiInvitacion, Workspace } from '../../models/workspace';
import { formatearFechaLegible } from '../../utils/fecha';
import { AuthService } from '../../services/auth.service';
import { CatalogsService } from '../../services/catalogs.service';
import { PreferencesService } from '../../services/preferences.service';
import { RemindersService } from '../../services/reminders.service';
import { ToastService } from '../../services/toast.service';
import { WorkspacesService } from '../../services/workspaces.service';

/** Dashboard de entrada a la app autenticada — antes era un saludo estático
 * con un solo botón a Workspaces. Reúne lo que ya existía disperso en otras
 * vistas (invitaciones pendientes, ya en views/workspaces) más una vista
 * nueva de recordatorios próximos (Backend/src/modules/reminders ya tenía
 * la API completa desde agosto, sin ninguna UI en el Frontend hasta ahora). */
@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SvgCampana, SvgCarpetas, SvgUsuarios],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  protected readonly authService = inject(AuthService);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly remindersService = inject(RemindersService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly catalogsService = inject(CatalogsService);
  private readonly toastService = inject(ToastService);

  protected readonly cargando = signal(true);
  protected readonly workspaces = signal<Workspace[]>([]);
  protected readonly recordatorios = signal<RecordatorioProximo[]>([]);
  protected readonly misInvitaciones = signal<MiInvitacion[]>([]);
  protected readonly aceptandoInvitacionId = signal<string | null>(null);
  private readonly zonaHoraria = signal<string | null>(null);

  constructor() {
    void this.cargarTodo();
  }

  private async cargarTodo(): Promise<void> {
    this.cargando.set(true);
    try {
      const [workspaces, invitaciones, recordatorios, preferencias, zonas] = await Promise.all([
        this.workspacesService.listar(),
        this.workspacesService.misInvitaciones(),
        this.remindersService.listarProximos(),
        this.preferencesService.cargar(),
        this.catalogsService.listarZonasHorarias(),
      ]);
      this.workspaces.set(workspaces);
      this.misInvitaciones.set(invitaciones);
      this.recordatorios.set(recordatorios);
      const zona = zonas.find((z) => z.id === preferencias.timezoneId);
      this.zonaHoraria.set(zona?.ianaName ?? null);
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.cargando.set(false);
    }
  }

  protected formatearFecha(iso: string): string {
    return formatearFechaLegible(iso, this.zonaHoraria());
  }

  protected async aceptarInvitacion(invitacion: MiInvitacion): Promise<void> {
    if (this.aceptandoInvitacionId()) return;

    this.aceptandoInvitacionId.set(invitacion.id);
    try {
      const resultado = await this.workspacesService.aceptarInvitacionPorId(invitacion.id);
      this.misInvitaciones.update((lista) => lista.filter((i) => i.id !== invitacion.id));
      this.workspaces.update((lista) =>
        lista.some((w) => w.id === resultado.workspace.id) ? lista : [resultado.workspace, ...lista],
      );
      this.toastService.exito(`Te uniste a "${resultado.workspace.name}".`);
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.aceptandoInvitacionId.set(null);
    }
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos cargar tu inicio. Intenta de nuevo.';
  }
}
