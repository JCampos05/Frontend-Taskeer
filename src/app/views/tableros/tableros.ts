import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ModalConfirmacion } from '../../components/modales/modal-confirmacion/modal-confirmacion';
import { SvgBasura } from '../../components/svgs/svg-basura/svg-basura';
import { SvgLapiz } from '../../components/svgs/svg-lapiz/svg-lapiz';
import { SvgTablero } from '../../components/svgs/svg-tablero/svg-tablero';
import { SvgUsuarios } from '../../components/svgs/svg-usuarios/svg-usuarios';
import { ErrorApi } from '../../models/auth';
import { Board } from '../../models/board';
import { WorkspaceRole } from '../../models/workspace';
import { AuthService } from '../../services/auth.service';
import { BoardsService } from '../../services/boards.service';
import { WorkspacesService } from '../../services/workspaces.service';
import { puedeGestionarTableros } from '../../utils/permisos';

@Component({
  selector: 'app-tableros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SvgTablero,
    SvgUsuarios,
    SvgLapiz,
    SvgBasura,
    ModalConfirmacion,
  ],
  templateUrl: './tableros.html',
  styleUrl: './tableros.css',
})
export class Tableros {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly boardsService = inject(BoardsService);

  protected readonly workspaceId = this.route.snapshot.paramMap.get('workspaceId')!;

  protected readonly cargando = signal(true);
  protected readonly creando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly workspaceNombre = signal('');
  protected readonly boards = signal<Board[]>([]);
  protected readonly miRol = signal<WorkspaceRole | null>(null);
  protected readonly mostrarFormulario = signal(false);
  protected readonly editandoId = signal<string | null>(null);
  protected readonly borrandoId = signal<string | null>(null);

  protected readonly puedeGestionar = puedeGestionarTableros;

  protected readonly formulario = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
  });

  protected readonly formularioRenombrar = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
  });

  constructor() {
    void this.cargar();
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      const [workspace, miembros, boards] = await Promise.all([
        this.workspacesService.obtener(this.workspaceId),
        this.workspacesService.listarMiembros(this.workspaceId),
        this.boardsService.listar(this.workspaceId),
      ]);
      this.workspaceNombre.set(workspace.name);
      this.boards.set(boards);

      const yo = this.authService.usuarioActual();
      const membresia = miembros.find((m) => m.userId === yo?.id);
      this.miRol.set(membresia?.role ?? null);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.cargando.set(false);
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
      const nuevo = await this.boardsService.crear(this.workspaceId, this.formulario.getRawValue());
      this.boards.update((lista) => [nuevo, ...lista]);
      this.formulario.reset();
      this.mostrarFormulario.set(false);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.creando.set(false);
    }
  }

  protected iniciarRenombrar(board: Board, evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.formularioRenombrar.setValue({ name: board.name });
    this.editandoId.set(board.id);
  }

  protected cancelarRenombrar(evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.editandoId.set(null);
  }

  protected async confirmarRenombrar(board: Board, evento: Event): Promise<void> {
    evento.preventDefault();
    evento.stopPropagation();

    if (this.formularioRenombrar.invalid) {
      this.formularioRenombrar.markAllAsTouched();
      return;
    }

    try {
      const actualizado = await this.boardsService.actualizar(this.workspaceId, board.id, {
        name: this.formularioRenombrar.getRawValue().name,
      });
      this.boards.update((lista) => lista.map((b) => (b.id === board.id ? actualizado : b)));
      this.editandoId.set(null);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    }
  }

  protected pedirBorrado(boardId: string, evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.borrandoId.set(boardId);
  }

  protected async confirmarBorrado(): Promise<void> {
    const boardId = this.borrandoId();
    if (!boardId) return;

    try {
      await this.boardsService.borrar(this.workspaceId, boardId);
      this.boards.update((lista) => lista.filter((b) => b.id !== boardId));
      this.borrandoId.set(null);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    }
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos completar la operación. Intenta de nuevo.';
  }
}
