import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { SvgCheck } from '../../svgs/svg-check/svg-check';
import { SvgCopiar } from '../../svgs/svg-copiar/svg-copiar';
import { SvgX } from '../../svgs/svg-x/svg-x';
import { WorkspaceMember, WorkspaceRole } from '../../../models/workspace';

/** Perfil de un miembro con su info pública — hoy el modelo de User no tiene
 * más que displayName/email/fecha de alta, así que es lo único que se
 * muestra (ver docs/02-modelo-datos.md). Autocontenido y sin llamadas a la
 * API propias: recibe todo por input desde donde se abra (miembros.html,
 * el panel de roles por tablero, y a futuro los assignee chips de tareas).
 */
@Component({
  selector: 'app-modal-perfil-usuario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkTrapFocus, SvgX, SvgCopiar, SvgCheck],
  templateUrl: './modal-perfil-usuario.html',
  styleUrl: './modal-perfil-usuario.css',
  host: { '(document:keydown.escape)': 'cerrar.emit()' },
})
export class ModalPerfilUsuario {
  readonly miembro = input.required<WorkspaceMember>();
  readonly esYo = input(false);
  /** Rol EFECTIVO en un board puntual, si el modal se abrió desde un
   * contexto de tablero (ej. el panel de roles por tablero) — `null` si no
   * aplica (ej. abierto desde miembros.html, que no tiene noción de board). */
  readonly rolEfectivoTablero = input<WorkspaceRole | null>(null);
  readonly nombreTablero = input<string | null>(null);

  readonly cerrar = output<void>();

  protected readonly correoCopiado = signal(false);

  protected async copiarCorreo(): Promise<void> {
    await navigator.clipboard.writeText(this.miembro().email);
    this.correoCopiado.set(true);
    setTimeout(() => this.correoCopiado.set(false), 2000);
  }

  /** Mes + año nada más — "miembro desde" no necesita el día exacto. Mayúscula
   * solo en la primera letra (no vía CSS text-transform: capitalize, que
   * también pondría en mayúscula la "de" del medio — "septiembre de 2026"
   * quedaría "Septiembre De 2026"). */
  protected formatearMiembroDesde(iso: string): string {
    const texto = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(
      new Date(iso),
    );
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
