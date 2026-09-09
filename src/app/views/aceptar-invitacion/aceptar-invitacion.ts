import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaginaEstado } from '../../components/principales/pagina-estado/pagina-estado';
import { SvgAdvertencia } from '../../components/svgs/svg-advertencia/svg-advertencia';
import { SvgCheck } from '../../components/svgs/svg-check/svg-check';
import { ErrorApi } from '../../models/auth';
import { Workspace } from '../../models/workspace';
import { WorkspacesService } from '../../services/workspaces.service';

type Estado = 'cargando' | 'exito' | 'error';

/** Página que resuelve el link de `sendWorkspaceInvitationEmail` en el
 * Backend (`PUBLIC_WEB_URL/invitaciones/aceptar?token=...`). Requiere sesión
 * (ver `authGuard` en app.routes.ts) — si el usuario no está logueado, el
 * guard lo manda a /login con `returnUrl` de vuelta a esta misma URL con el
 * token, así que no hace falta manejar el caso "no autenticado" aquí. */
@Component({
  selector: 'app-aceptar-invitacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaEstado, RouterLink, SvgCheck, SvgAdvertencia],
  templateUrl: './aceptar-invitacion.html',
  styleUrl: './aceptar-invitacion.css',
})
export class AceptarInvitacion {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workspacesService = inject(WorkspacesService);

  protected readonly estado = signal<Estado>('cargando');
  protected readonly errorMensaje = signal('El enlace no es válido o venció.');
  protected readonly workspace = signal<Workspace | null>(null);
  protected readonly yaEraMiembro = signal(false);

  constructor() {
    void this.aceptar();
  }

  private async aceptar(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.estado.set('error');
      return;
    }

    try {
      const resultado = await this.workspacesService.aceptarInvitacion(token);
      this.workspace.set(resultado.workspace);
      this.yaEraMiembro.set(resultado.alreadyMember);
      this.estado.set('exito');
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
      this.estado.set('error');
    }
  }

  protected async irAlWorkspace(): Promise<void> {
    const ws = this.workspace();
    if (!ws) return;
    await this.router.navigateByUrl(`/app/workspaces/${ws.id}`);
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'El enlace no es válido o venció.';
  }
}
