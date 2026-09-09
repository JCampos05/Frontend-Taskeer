import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
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

  async listar(): Promise<Workspace[]> {
    const respuesta = await firstValueFrom(
      this.http.get<{ workspaces: Workspace[] }>(`${environment.apiUrl}/workspaces`),
    );
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
    return respuesta.workspace;
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
