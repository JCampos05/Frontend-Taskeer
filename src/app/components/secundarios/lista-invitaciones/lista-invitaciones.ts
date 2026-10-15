import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MiInvitacion } from '../../../models/workspace';

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'administrador',
  EDITOR: 'editor',
  VIEWER: 'solo lectura',
};

/** Lista de invitaciones pendientes del usuario con su botón "Aceptar".
 * Es solo presentación: quien la usa decide qué pasa al aceptar (cada vista
 * actualiza sus propias listas). Reemplaza el markup que estaba duplicado en
 * Inicio, Mi día y Workspaces. */
@Component({
  selector: 'app-lista-invitaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lista-invitaciones.html',
  styleUrl: './lista-invitaciones.css',
})
export class ListaInvitaciones {
  readonly invitaciones = input.required<MiInvitacion[]>();
  /** Id de la invitación que se está aceptando ahora, para deshabilitar su botón. */
  readonly aceptandoId = input<string | null>(null);
  readonly aceptar = output<MiInvitacion>();

  protected etiquetaRol(rol: string): string {
    return ETIQUETA_ROL[rol] ?? 'solo lectura';
  }
}
