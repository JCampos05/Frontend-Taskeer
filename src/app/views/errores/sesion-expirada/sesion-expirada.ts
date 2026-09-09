import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginaEstado } from '../../../components/principales/pagina-estado/pagina-estado';
import { SvgReloj } from '../../../components/svgs/svg-reloj/svg-reloj';

@Component({
  selector: 'app-sesion-expirada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaEstado, RouterLink, SvgReloj],
  template: `
    <app-pagina-estado
      titulo="Tu sesión expiró"
      descripcion="Por tu seguridad, cerramos la sesión tras un tiempo de inactividad. Vuelve a iniciar sesión para continuar."
    >
      <app-svg-reloj ilustracion />
      <a acciones class="boton boton--primario" routerLink="/login">Iniciar sesión</a>
    </app-pagina-estado>
  `,
})
export class SesionExpirada {}
