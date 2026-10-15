import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SvgChevron } from '../../svgs/svg-chevron/svg-chevron';
import { SvgDiamante } from '../../svgs/svg-diamante/svg-diamante';
import { SvgEngranaje } from '../../svgs/svg-engranaje/svg-engranaje';
import { SvgPersona } from '../../svgs/svg-persona/svg-persona';
import { SvgSalir } from '../../svgs/svg-salir/svg-salir';
import { AuthService } from '../../../services/auth.service';
import { NotificationsStreamService } from '../../../services/notifications-stream.service';

/** Chip de usuario clickeable — abre un menú (Mi Perfil / Configuración /
 * Cerrar Sesión) en vez de tener un ícono de salir suelto y un item de
 * Configuración aparte en la navegación. */
@Component({
  selector: 'app-menu-perfil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SvgChevron, SvgPersona, SvgDiamante, SvgEngranaje, SvgSalir],
  templateUrl: './menu-perfil.html',
  styleUrl: './menu-perfil.css',
})
export class MenuPerfil {
  protected readonly authService = inject(AuthService);
  private readonly notificationsStreamService = inject(NotificationsStreamService);
  private readonly router = inject(Router);

  protected readonly abierto = signal(false);
  private readonly botonRef = viewChild.required<ElementRef<HTMLButtonElement>>('boton');

  protected readonly posicion = signal<{ bottom: number; left: number } | null>(null);

  protected alternarMenu(): void {
    const abriendo = !this.abierto();
    this.abierto.set(abriendo);

    if (abriendo) {
      const rect = this.botonRef().nativeElement.getBoundingClientRect();
      this.posicion.set({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
    }
  }

  protected cerrarMenu(): void {
    this.abierto.set(false);
  }

  protected async cerrarSesion(): Promise<void> {
    this.cerrarMenu();
    this.notificationsStreamService.desconectar();
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}
