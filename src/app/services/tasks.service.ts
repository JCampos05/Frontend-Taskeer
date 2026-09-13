import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import {
  ActualizarSubtaskInput,
  ActualizarTaskInput,
  CrearSubtaskInput,
  CrearTaskInput,
  MoverTaskInput,
  Subtask,
  Task,
} from '../models/task';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);

  async crear(input: CrearTaskInput): Promise<Task> {
    const respuesta = await firstValueFrom(
      this.http.post<{ task: Task }>(`${environment.apiUrl}/tasks`, input),
    );
    return respuesta.task;
  }

  async obtener(taskId: string): Promise<Task> {
    const respuesta = await firstValueFrom(
      this.http.get<{ task: Task }>(`${environment.apiUrl}/tasks/${taskId}`),
    );
    return respuesta.task;
  }

  async actualizar(taskId: string, input: ActualizarTaskInput): Promise<Task> {
    const respuesta = await firstValueFrom(
      this.http.patch<{ task: Task }>(`${environment.apiUrl}/tasks/${taskId}`, input),
    );
    return respuesta.task;
  }

  async mover(taskId: string, input: MoverTaskInput): Promise<Task> {
    const respuesta = await firstValueFrom(
      this.http.post<{ task: Task }>(`${environment.apiUrl}/tasks/${taskId}/move`, input),
    );
    return respuesta.task;
  }

  async borrar(taskId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${environment.apiUrl}/tasks/${taskId}`));
  }

  async listarSubtareas(taskId: string): Promise<Subtask[]> {
    const respuesta = await firstValueFrom(
      this.http.get<{ subtasks: Subtask[] }>(`${environment.apiUrl}/tasks/${taskId}/subtasks`),
    );
    return respuesta.subtasks;
  }

  async crearSubtarea(taskId: string, input: CrearSubtaskInput): Promise<Subtask> {
    const respuesta = await firstValueFrom(
      this.http.post<{ subtask: Subtask }>(`${environment.apiUrl}/tasks/${taskId}/subtasks`, input),
    );
    return respuesta.subtask;
  }

  async actualizarSubtarea(
    taskId: string,
    subtaskId: string,
    input: ActualizarSubtaskInput,
  ): Promise<Subtask> {
    const respuesta = await firstValueFrom(
      this.http.patch<{ subtask: Subtask }>(
        `${environment.apiUrl}/tasks/${taskId}/subtasks/${subtaskId}`,
        input,
      ),
    );
    return respuesta.subtask;
  }

  async borrarSubtarea(taskId: string, subtaskId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/tasks/${taskId}/subtasks/${subtaskId}`),
    );
  }
}
