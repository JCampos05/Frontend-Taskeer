import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import {
  AceptarInvitacionResultado,
  CrearInvitacionInput,
  CrearWorkspaceInput,
  Invitation,
  MiInvitacion,
  Workspace,
  WorkspaceMember,
  WorkspaceRoleAsignable,
} from '../models/workspace';

@Injectable({ providedIn: 'root' })
export class WorkspacesService {
  private readonly http = inject(HttpClient);

  /** Última lista conocida de workspaces del usuario — la alimenta `listar()`
   * y `crear()`, y la lee la barra lateral para mostrarlos como accesos
   * rápidos sin pedir la lista otra vez en cada vista. */
  readonly workspacesConocidos = signal<Workspace[]>([]);

  async listar(): Promise<Workspace[]> {
    const respuesta = await firstValueFrom(
      this.http.get<{ workspaces: Workspace[] }>(`${environment.apiUrl}/workspaces`),
    );
    this.workspacesConocidos.set(respuesta.workspaces);
    return respuesta.workspaces;
  }

  async obtener(workspaceId: string): Promise<Workspace> {
    const respuesta = await firstValueFrom(
      this.http.get<{ workspace: Workspace }>(`${environment.apiUrl}/workspaces/${workspaceId}`),
    );
    return respuesta.workspace;
  }

  async crear(input: CrearWorkspaceInput): Promise<Workspace> {
    const respuesta = await firstValueFrom(
      this.http.post<{ workspace: Workspace }>(`${environment.apiUrl}/workspaces`, input),
    );
    // Quien crea un workspace es su propietario (la respuesta de creación no trae el rol).
    const creado: Workspace = { ...respuesta.workspace, myRole: 'OWNER' };
    this.workspacesConocidos.update((lista) => [creado, ...lista]);
    return creado;
  }

  /** Renombra un workspace (OWNER o ADMIN en el backend). */
  async actualizar(workspaceId: string, input: { name: string }): Promise<Workspace> {
    const respuesta = await firstValueFrom(
      this.http.patch<{ workspace: Workspace }>(
        `${environment.apiUrl}/workspaces/${workspaceId}`,
        input,
      ),
    );
    // La respuesta de PATCH no trae el rol de quien consulta: se conserva el que ya se conocía.
    const rolAnterior = this.workspacesConocidos().find((w) => w.id === workspaceId)?.myRole;
    const actualizado: Workspace = { ...respuesta.workspace, myRole: rolAnterior };
    this.workspacesConocidos.update((lista) =>
      lista.map((w) => (w.id === workspaceId ? actualizado : w)),
    );
    return actualizado;
  }

  /** Elimina un workspace (solo OWNER; soft delete en el backend: sus tableros
   * y tareas quedan inaccesibles para todos los miembros). */
  async eliminar(workspaceId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${environment.apiUrl}/workspaces/${workspaceId}`));
    this.workspacesConocidos.update((lista) => lista.filter((w) => w.id !== workspaceId));
  }

  async listarMiembros(workspaceId: string): Promise<WorkspaceMember[]> {
    const respuesta = await firstValueFrom(
      this.http.get<{ members: WorkspaceMember[] }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/members`,
      ),
    );
    return respuesta.members;
  }

  async actualizarRolMiembro(
    workspaceId: string,
    userId: string,
    role: WorkspaceRoleAsignable,
  ): Promise<WorkspaceMember> {
    const respuesta = await firstValueFrom(
      this.http.patch<{ member: WorkspaceMember }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/members/${userId}`,
        { role },
      ),
    );
    return respuesta.member;
  }

  async eliminarMiembro(workspaceId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/workspaces/${workspaceId}/members/${userId}`),
    );
  }

  async transferirPropiedad(workspaceId: string, newOwnerUserId: string): Promise<Workspace> {
    const respuesta = await firstValueFrom(
      this.http.post<{ workspace: Workspace }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/transfer-ownership`,
        { newOwnerUserId },
      ),
    );
    return respuesta.workspace;
  }

  async crearInvitacion(workspaceId: string, input: CrearInvitacionInput): Promise<Invitation> {
    const respuesta = await firstValueFrom(
      this.http.post<{ invitation: Invitation }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/invitations`,
        input,
      ),
    );
    return respuesta.invitation;
  }

  async listarInvitaciones(workspaceId: string): Promise<Invitation[]> {
    const respuesta = await firstValueFrom(
      this.http.get<{ invitations: Invitation[] }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/invitations`,
      ),
    );
    return respuesta.invitations;
  }

  async revocarInvitacion(workspaceId: string, invitationId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(
        `${environment.apiUrl}/workspaces/${workspaceId}/invitations/${invitationId}`,
      ),
    );
  }

  async aceptarInvitacion(token: string): Promise<AceptarInvitacionResultado> {
    return firstValueFrom(
      this.http.post<AceptarInvitacionResultado>(
        `${environment.apiUrl}/invitations/accept`,
        {},
        { params: { token } },
      ),
    );
  }

  async misInvitaciones(): Promise<MiInvitacion[]> {
    const respuesta = await firstValueFrom(
      this.http.get<{ invitations: MiInvitacion[] }>(`${environment.apiUrl}/invitations/mine`),
    );
    return respuesta.invitations;
  }

  async aceptarInvitacionPorId(invitationId: string): Promise<AceptarInvitacionResultado> {
    return firstValueFrom(
      this.http.post<AceptarInvitacionResultado>(
        `${environment.apiUrl}/invitations/${invitationId}/accept`,
        {},
      ),
    );
  }
}
