import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * Muestra los 10 códigos de recuperación en texto plano — UNA sola vez,
 * con opción de copiar o descargar como .txt (ver
 * docs/03-autenticacion-seguridad.md). Reutilizable desde crear-cuenta y,
 * más adelante, desde la regeneración de códigos en configuración.
 */
@Component({
  selector: 'app-codigos-recuperacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './codigos-recuperacion.html',
  styleUrl: './codigos-recuperacion.css',
})
export class CodigosRecuperacion {
  readonly codigos = input.required<string[]>();

  protected readonly copiado = signal(false);

  protected async copiarTodos(): Promise<void> {
    await navigator.clipboard.writeText(this.codigos().join('\n'));
    this.copiado.set(true);
    setTimeout(() => this.copiado.set(false), 2000);
  }

  protected descargarTxt(): void {
    const contenido = [
      'Códigos de recuperación de Taskeer',
      'Guárdalos en un lugar seguro — cada uno solo sirve una vez.',
      '',
      ...this.codigos(),
    ].join('\n');

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'taskeer-codigos-recuperacion.txt';
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
