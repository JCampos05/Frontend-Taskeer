import { ListaInvitaciones } from '../../components/secundarios/lista-invitaciones/lista-invitaciones';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ConfirmacionEliminarWorkspace,
  ModalEliminarWorkspace,
} from '../../components/modales/modal-eliminar-workspace/modal-eliminar-workspace';
import { SvgBasura } from '../../components/svgs/svg-basura/svg-basura';
import { SvgCarpetas } from '../../components/svgs/svg-carpetas/svg-carpetas';
import { SvgLapiz } from '../../components/svgs/svg-lapiz/svg-lapiz';
import { ErrorApi } from '../../models/auth';
import { Board } from '../../models/board';
import { MiInvitacion, Workspace } from '../../models/workspace';
import { AuthService } from '../../services/auth.service';
import { BoardsService } from '../../services/boards.service';
import { ToastService } from '../../services/toast.service';
import { WorkspacesService } from '../../services/workspaces.service';

@Component({
  selector: 'app-workspaces',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ListaInvitaciones, ModalEliminarWorkspace, SvgBasura, SvgCarpetas, SvgLapiz],
  templateUrl: './workspaces.html',
  styleUrl: './workspaces.css',
})
export class WorkspacesVista {
  private readonly fb = inject(FormBuilder);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly boardsService = inject(BoardsService);

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

  // --- Editar / eliminar (solo el propietario las ve en la lista) ---
  protected readonly editandoId = signal<string | null>(null);
  protected readonly borrando = signal<Workspace | null>(null);
  protected readonly tablerosDelBorrado = signal<Board[] | null>(null);
  protected readonly eliminando = signal(false);

  protected readonly formularioRenombrar = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
  });

  protected readonly totalTablerosBorrado = computed(() => this.tablerosDelBorrado()?.length ?? null);

  /** Workspaces a los que se pueden mover los tableros del que se borra:
   * aquellos donde el usuario es propietario o administrador. */
  protected readonly destinosBorrado = computed(() => {
    const origen = this.borrando();
    return this.workspaces().filter(
      (w) => w.id !== origen?.id && (w.myRole === 'OWNER' || w.myRole === 'ADMIN'),
    );
  });

  /** Solo el propietario puede eliminar el workspace. */
  protected esPropietario(workspace: Workspace): boolean {
    return workspace.myRole
      ? workspace.myRole === 'OWNER'
      : workspace.ownerId === this.authService.usuarioActual()?.id;
  }

  /** Propietario y administradores pueden renombrarlo. */
  protected puedeEditar(workspace: Workspace): boolean {
    return this.esPropietario(workspace) || workspace.myRole === 'ADMIN';
  }

  protected iniciarRenombrar(workspace: Workspace): void {
    this.formularioRenombrar.setValue({ name: workspace.name });
    this.editandoId.set(workspace.id);
  }

  protected cancelarRenombrar(): void {
    this.editandoId.set(null);
  }

  protected async confirmarRenombrar(workspace: Workspace): Promise<void> {
    if (this.formularioRenombrar.invalid) {
      this.formularioRenombrar.markAllAsTouched();
      return;
    }

    const nombre = this.formularioRenombrar.getRawValue().name;
    if (nombre === workspace.name) {
      this.editandoId.set(null);
      return;
    }

    try {
      const actualizado = await this.workspacesService.actualizar(workspace.id, { name: nombre });
      this.workspaces.update((lista) => lista.map((w) => (w.id === workspace.id ? actualizado : w)));
      this.editandoId.set(null);
      this.toastService.exito(`Workspace renombrado a "${actualizado.name}".`);
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    }
  }

  protected async pedirBorrado(workspace: Workspace): Promise<void> {
    this.borrando.set(workspace);
    this.tablerosDelBorrado.set(null);
    try {
      const tableros = await this.boardsService.listar(workspace.id);
      // Solo si el modal sigue abierto para este mismo workspace.
      if (this.borrando()?.id === workspace.id) this.tablerosDelBorrado.set(tableros);
    } catch {
      // Sin el conteo el mensaje usa la redacción genérica; no bloquea el borrado.
    }
  }

  protected cancelarBorrado(): void {
    if (this.eliminando()) return;
    this.borrando.set(null);
  }

  protected async confirmarBorrado(decision: ConfirmacionEliminarWorkspace): Promise<void> {
    const workspace = this.borrando();
    if (!workspace || this.eliminando()) return;

    this.eliminando.set(true);
    try {
      let aviso = '';

      // Si el usuario eligió conservar los tableros, se mueven ANTES de borrar el
      // workspace; si el movimiento falla, el workspace no se toca.
      if (decision.accion === 'mover' && decision.destinoId) {
        const tableros = this.tablerosDelBorrado() ?? [];
        if (tableros.length > 0) {
          const resultado = await this.boardsService.mover(workspace.id, {
            targetWorkspaceId: decision.destinoId,
            boardIds: tableros.map((t) => t.id),
          });
          const destino = this.workspaces().find((w) => w.id === decision.destinoId)?.name ?? 'el destino';
          aviso =
            ` ${resultado.boards.length} ${resultado.boards.length === 1 ? 'tablero se movió' : 'tableros se movieron'} a "${destino}"` +
            (resultado.tasksUnassigned > 0
              ? ` (${resultado.tasksUnassigned} ${resultado.tasksUnassigned === 1 ? 'tarea quedó sin asignar' : 'tareas quedaron sin asignar'}).`
              : '.');
        }
      }

      await this.workspacesService.eliminar(workspace.id);
      this.workspaces.update((lista) => lista.filter((w) => w.id !== workspace.id));
      this.borrando.set(null);
      this.toastService.exito(`Workspace "${workspace.name}" eliminado.${aviso}`);
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.eliminando.set(false);
    }
  }

  constructor() {
    void this.cargar();
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    this.errorMensaje.set(null);
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
      // Se vuelve a pedir la lista para traer el rol (myRole) del workspace al que se unió.
      this.workspaces.set(await this.workspacesService.listar());
      this.toastService.exito(`Te uniste a "${resultado.workspace.name}".`);
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
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
