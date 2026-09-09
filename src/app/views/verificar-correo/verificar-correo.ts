import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaginaEstado } from '../../components/principales/pagina-estado/pagina-estado';
import { SvgAdvertencia } from '../../components/svgs/svg-advertencia/svg-advertencia';
import { SvgCheck } from '../../components/svgs/svg-check/svg-check';
import { AuthService } from '../../services/auth.service';

type Estado = 'cargando' | 'exito' | 'error';

@Component({
  selector: 'app-verificar-correo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaEstado, RouterLink, SvgCheck, SvgAdvertencia],
  templateUrl: './verificar-correo.html',
  styleUrl: './verificar-correo.css',
})
export class VerificarCorreo {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly estado = signal<Estado>('cargando');

  constructor() {
    void this.verificar();
  }

  private async verificar(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.estado.set('error');
      return;
    }

    try {
      await this.authService.verifyEmail(token);
      this.estado.set('exito');
    } catch {
      this.estado.set('error');
    }
  }
}
