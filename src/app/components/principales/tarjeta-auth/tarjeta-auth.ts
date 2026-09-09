import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Layout compartido por login y crear-cuenta — tarjeta centrada con
 * título/subtítulo, el formulario proyectado, y un pie con links
 * (ej. "¿No tienes cuenta? Regístrate"). */
@Component({
  selector: 'app-tarjeta-auth',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './tarjeta-auth.html',
  styleUrl: './tarjeta-auth.css',
})
export class TarjetaAuth {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>();
}
