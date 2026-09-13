import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import {
  ActualizarBoardInput,
  ActualizarColumnaInput,
  Board,
  BoardDetalle,
  BoardMemberOverride,
  Columna,
  CrearBoardInput,
  CrearColumnaInput,
} from '../models/board';
import { WorkspaceRole } from '../models/workspace';

@Injectable({ providedIn: 'root' })
export class BoardsService {
  private readonly http = inject(HttpClient);

  async listar(workspaceId: string): Promise<Board[]> {
    const respuesta = await firstValueFrom(
      this.http.get<{ boards: Board[] }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/boards`,
      ),
    );
    return respuesta.boards;
  }

  async crear(workspaceId: string, input: CrearBoardInput): Promise<Board> {
    const respuesta = await firstValueFrom(
      this.http.post<{ board: Board }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/boards`,
        input,
      ),
    );
    return respuesta.board;
  }

  async obtenerDetalle(workspaceId: string, boardId: string): Promise<BoardDetalle> {
    const respuesta = await firstValueFrom(
      this.http.get<{ board: BoardDetalle }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/boards/${boardId}`,
      ),
    );
    return respuesta.board;
  }

  async actualizar(
    workspaceId: string,
    boardId: string,
    input: ActualizarBoardInput,
  ): Promise<Board> {
    const respuesta = await firstValueFrom(
      this.http.patch<{ board: Board }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/boards/${boardId}`,
        input,
      ),
    );
    return respuesta.board;
  }

  async borrar(workspaceId: string, boardId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/workspaces/${workspaceId}/boards/${boardId}`),
    );
  }

  async crearColumna(
    workspaceId: string,
    boardId: string,
    input: CrearColumnaInput,
  ): Promise<Columna> {
    const respuesta = await firstValueFrom(
      this.http.post<{ column: Columna }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/boards/${boardId}/columns`,
        input,
      ),
    );
    return respuesta.column;
  }

  async actualizarColumna(
    workspaceId: string,
    boardId: string,
    columnId: string,
    input: ActualizarColumnaInput,
  ): Promise<Columna> {
    const respuesta = await firstValueFrom(
      this.http.patch<{ column: Columna }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`,
        input,
      ),
    );
    return respuesta.column;
  }

  async borrarColumna(workspaceId: string, boardId: string, columnId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(
        `${environment.apiUrl}/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`,
      ),
    );
  }

  async listarOverridesDeRol(workspaceId: string, boardId: string): Promise<BoardMemberOverride[]> {
    const respuesta = await firstValueFrom(
      this.http.get<{ overrides: BoardMemberOverride[] }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/boards/${boardId}/member-overrides`,
      ),
    );
    return respuesta.overrides;
  }

  async asignarOverrideDeRol(
    workspaceId: string,
    boardId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<BoardMemberOverride> {
    const respuesta = await firstValueFrom(
      this.http.put<{ override: BoardMemberOverride }>(
        `${environment.apiUrl}/workspaces/${workspaceId}/boards/${boardId}/member-overrides/${userId}`,
        { role },
      ),
    );
    return respuesta.override;
  }

  async quitarOverrideDeRol(workspaceId: string, boardId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(
        `${environment.apiUrl}/workspaces/${workspaceId}/boards/${boardId}/member-overrides/${userId}`,
      ),
    );
  }
}
