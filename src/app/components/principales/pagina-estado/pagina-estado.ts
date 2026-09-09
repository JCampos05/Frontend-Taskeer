import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Layout compartido por todas las páginas de error/estado del sistema
 * (404, 403, 500, servicio caído, sin conexión, sesión expirada) — evita
 * duplicar la misma estructura visual seis veces. Las vistas concretas
 * proyectan sus propias acciones (botones) vía <ng-content select="[acciones]">.
 */
@Component({
  selector: 'app-pagina-estado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagina-estado.html',
  styleUrl: './pagina-estado.css',
})
export class PaginaEstado {
  readonly codigo = input<string>();
  readonly titulo = input.required<string>();
  readonly descripcion = input<string>();
}
