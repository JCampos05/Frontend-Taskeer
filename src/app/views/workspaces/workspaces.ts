import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SvgCarpetas } from '../../components/svgs/svg-carpetas/svg-carpetas';
import { ErrorApi } from '../../models/auth';
import { MiInvitacion, Workspace } from '../../models/workspace';
import { ToastService } from '../../services/toast.service';
import { WorkspacesService } from '../../services/workspaces.service';

@Component({
  selector: 'app-workspaces',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, SvgCarpetas],
  templateUrl: './workspaces.html',
  styleUrl: './workspaces.css',
})
export class WorkspacesVista {
  private readonly fb = inject(FormBuilder);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly toastService = inject(ToastService);

  protected readonly cargando = signal(true);
  protected readonly creando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly workspaces = signal<Workspace[]>([]);
  protected readonly mostrarFormulario = signal(false);

  protected readonly misInvitaciones = signal<MiInvitacion[]>([]);
  protected readonly aceptandoInvitacionId = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
  });

  constructor() {
    void this.cargar();
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      const [workspaces, invitaciones] = await Promise.all([
        this.workspacesService.listar(),
        this.workspacesService.misInvitaciones(),
      ]);
      this.workspaces.set(workspaces);
      this.misInvitaciones.set(invitaciones);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.cargando.set(false);
    }
  }

  protected async aceptarInvitacion(invitacion: MiInvitacion): Promise<void> {
    if (this.aceptandoInvitacionId()) return;

    this.aceptandoInvitacionId.set(invitacion.id);
    try {
      const resultado = await this.workspacesService.aceptarInvitacionPorId(invitacion.id);
      this.misInvitaciones.update((lista) => lista.filter((i) => i.id !== invitacion.id));
      // Si ya era miembro (ej. aceptó desde otra pestaña/el correo mientras
      // tanto), no duplicamos la tarjeta en la lista.
      this.workspaces.update((lista) =>
        lista.some((w) => w.id === resultado.workspace.id) ? lista : [resultado.workspace, ...lista],
      );
      this.toastService.exito(`Te uniste a "${resultado.workspace.name}".`);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.aceptandoInvitacionId.set(null);
    }
  }

  protected async crear(): Promise<void> {
    if (this.formulario.invalid || this.creando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.creando.set(true);
    this.errorMensaje.set(null);

    try {
      const nuevo = await this.workspacesService.crear(this.formulario.getRawValue());
      this.workspaces.update((lista) => [nuevo, ...lista]);
      this.formulario.reset();
      this.mostrarFormulario.set(false);
    } catch (err) {
      // Caso especial: llegar al límite de workspaces del plan no es una
      // falla de la app — un error rojo asusta al usuario sin necesidad.
      // Se muestra como advertencia (toast) en vez del banner de error
      // inline, con el mensaje orientado a subir de plan.
      if (this.obtenerCodigoError(err) === 'WORKSPACE_LIMIT_REACHED') {
        this.toastService.advertencia(this.obtenerMensajeError(err), {
          titulo: 'Límite de tu plan alcanzado',
        });
      } else {
        this.errorMensaje.set(this.obtenerMensajeError(err));
      }
    } finally {
      this.creando.set(false);
    }
  }

  private obtenerCodigoError(err: unknown): string | null {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      return cuerpo?.error?.code ?? null;
    }
    return null;
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos completar la operación. Intenta de nuevo.';
  }
}
