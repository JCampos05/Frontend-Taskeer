import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalConfirmacion } from '../../components/modales/modal-confirmacion/modal-confirmacion';
import { ModalPerfilUsuario } from '../../components/modales/modal-perfil-usuario/modal-perfil-usuario';
import { BotonVolver } from '../../components/secundarios/boton-volver/boton-volver';
import { SvgBasura } from '../../components/svgs/svg-basura/svg-basura';
import { ErrorApi } from '../../models/auth';
import {
  Invitation,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceRoleAsignable,
} from '../../models/workspace';
import { AuthService } from '../../services/auth.service';
import { WorkspacesService } from '../../services/workspaces.service';
import { puedeGestionarTableros } from '../../utils/permisos';

const ROLES_ASIGNABLES: WorkspaceRoleAsignable[] = ['ADMIN', 'EDITOR', 'VIEWER'];

const ETIQUETA_ROL: Record<WorkspaceRole, string> = {
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Solo lectura',
};

const ETIQUETA_ESTADO_INVITACION: Record<Invitation['status'], string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  EXPIRED: 'Vencida',
  REVOKED: 'Revocada',
};

@Component({
  selector: 'app-miembros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SvgBasura, ModalConfirmacion, ModalPerfilUsuario, BotonVolver],
  templateUrl: './miembros.html',
  styleUrl: './miembros.css',
})
export class Miembros {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly workspacesService = inject(WorkspacesService);

  protected readonly workspaceId = this.route.snapshot.paramMap.get('workspaceId')!;
  protected readonly miId = this.authService.usuarioActual()?.id ?? null;

  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly workspaceNombre = signal('');
  protected readonly miembros = signal<WorkspaceMember[]>([]);
  protected readonly invitaciones = signal<Invitation[]>([]);
  protected readonly miRol = signal<WorkspaceRole | null>(null);

  protected readonly pestana = signal<'miembros' | 'invitaciones'>('miembros');
  protected readonly busqueda = signal('');
  protected readonly filtroRol = signal<WorkspaceRole | ''>('');

  protected readonly miembrosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const rol = this.filtroRol();
    return this.miembros().filter(
      (m) =>
        (rol === '' || m.role === rol) &&
        (texto === '' ||
          m.displayName.toLowerCase().includes(texto) ||
          m.email.toLowerCase().includes(texto)),
    );
  });

  protected readonly invitacionesPendientes = computed(
    () =>
      this.invitaciones().filter(
        (i) => i.status === 'PENDING' && new Date(i.expiresAt) >= new Date(),
      ).length,
  );

  protected readonly mostrarFormularioInvitar = signal(false);
  protected readonly invitando = signal(false);
  protected readonly quitandoUserId = signal<string | null>(null);
  protected readonly transfiriendoA = signal<WorkspaceMember | null>(null);
  protected readonly saliendo = signal(false);
  protected readonly procesando = signal(false);
  protected readonly verPerfilDe = signal<WorkspaceMember | null>(null);

  protected readonly rolesAsignables = ROLES_ASIGNABLES;
  protected readonly etiquetaRol = ETIQUETA_ROL;
  protected readonly etiquetaEstadoInvitacion = ETIQUETA_ESTADO_INVITACION;
  protected readonly puedeGestionar = puedeGestionarTableros;

  protected readonly formularioInvitar = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['EDITOR' as WorkspaceRoleAsignable, [Validators.required]],
  });

  constructor() {
    void this.cargar();
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      const [workspace, miembros] = await Promise.all([
        this.workspacesService.obtener(this.workspaceId),
        this.workspacesService.listarMiembros(this.workspaceId),
      ]);
      this.workspaceNombre.set(workspace.name);
      this.miembros.set(miembros);

      const membresia = miembros.find((m) => m.userId === this.miId);
      const rol = membresia?.role ?? null;
      this.miRol.set(rol);

      // Solo OWNER/ADMIN pueden listar invitaciones — el resto ni lo
      // intenta, para no pedir un endpoint que le va a responder 403.
      if (puedeGestionarTableros(rol)) {
        this.invitaciones.set(await this.workspacesService.listarInvitaciones(this.workspaceId));
      }
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.cargando.set(false);
    }
  }

  protected fechaMiembro(iso: string): string {
    return new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric' }).format(new Date(iso));
  }

  protected invitacionVencida(invitacion: Invitation): boolean {
    return invitacion.status === 'PENDING' && new Date(invitacion.expiresAt) < new Date();
  }

  protected puedeQuitar(member: WorkspaceMember): boolean {
    return (
      member.role !== 'OWNER' && member.userId !== this.miId && this.puedeGestionar(this.miRol())
    );
  }

  protected puedeTransferir(member: WorkspaceMember): boolean {
    return this.miRol() === 'OWNER' && member.userId !== this.miId && member.role !== 'OWNER';
  }

  protected async invitar(): Promise<void> {
    if (this.formularioInvitar.invalid || this.invitando()) {
      this.formularioInvitar.markAllAsTouched();
      return;
    }

    this.invitando.set(true);
    this.errorMensaje.set(null);

    try {
      const nueva = await this.workspacesService.crearInvitacion(
        this.workspaceId,
        this.formularioInvitar.getRawValue(),
      );
      this.invitaciones.update((lista) => [nueva, ...lista]);
      this.formularioInvitar.reset({ email: '', role: 'EDITOR' });
      this.mostrarFormularioInvitar.set(false);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.invitando.set(false);
    }
  }

  protected async revocarInvitacion(invitacion: Invitation): Promise<void> {
    try {
      await this.workspacesService.revocarInvitacion(this.workspaceId, invitacion.id);
      this.invitaciones.update((lista) =>
        lista.map((i) => (i.id === invitacion.id ? { ...i, status: 'REVOKED' } : i)),
      );
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    }
  }

  protected async cambiarRol(member: WorkspaceMember, nuevoRol: string): Promise<void> {
    const rol = nuevoRol as WorkspaceRoleAsignable;
    if (rol === member.role) return;

    try {
      const actualizado = await this.workspacesService.actualizarRolMiembro(
        this.workspaceId,
        member.userId,
        rol,
      );
      this.miembros.update((lista) =>
        lista.map((m) => (m.userId === member.userId ? actualizado : m)),
      );
      if (member.userId === this.miId) {
        this.miRol.set(actualizado.role);
      }
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
      // Revertir el <select> a lo que de verdad quedó guardado.
      this.miembros.update((lista) => [...lista]);
    }
  }

  protected async confirmarQuitar(): Promise<void> {
    const userId = this.quitandoUserId();
    if (!userId || this.procesando()) return;

    this.procesando.set(true);
    try {
      await this.workspacesService.eliminarMiembro(this.workspaceId, userId);
      this.miembros.update((lista) => lista.filter((m) => m.userId !== userId));
      this.quitandoUserId.set(null);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
      this.quitandoUserId.set(null);
    } finally {
      this.procesando.set(false);
    }
  }

  protected async confirmarSalir(): Promise<void> {
    if (!this.miId || this.procesando()) return;

    this.procesando.set(true);
    try {
      await this.workspacesService.eliminarMiembro(this.workspaceId, this.miId);
      await this.router.navigateByUrl('/app/workspaces');
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
      this.saliendo.set(false);
    } finally {
      this.procesando.set(false);
    }
  }

  protected async confirmarTransferir(): Promise<void> {
    const destino = this.transfiriendoA();
    if (!destino || this.procesando()) return;

    this.procesando.set(true);
    try {
      await this.workspacesService.transferirPropiedad(this.workspaceId, destino.userId);
      this.miembros.update((lista) =>
        lista.map((m) => {
          if (m.userId === destino.userId) return { ...m, role: 'OWNER' };
          if (m.userId === this.miId) return { ...m, role: 'ADMIN' };
          return m;
        }),
      );
      this.miRol.set('ADMIN');
      this.transfiriendoA.set(null);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
      this.transfiriendoA.set(null);
    } finally {
      this.procesando.set(false);
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
