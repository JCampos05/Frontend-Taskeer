import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SvgCheck } from '../../svgs/svg-check/svg-check';
import { SvgAdvertencia } from '../../svgs/svg-advertencia/svg-advertencia';
import { SvgError } from '../../svgs/svg-error/svg-error';
import { SvgX } from '../../svgs/svg-x/svg-x';
import { SvgInfo } from '../../svgs/svg-info/svg-info';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-contenedor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SvgCheck, SvgAdvertencia, SvgError, SvgInfo, SvgX],
  templateUrl: './toast-contenedor.html',
  styleUrl: './toast-contenedor.css',
})
export class ToastContenedor {
  protected readonly toastService = inject(ToastService);

  protected cerrar(id: string): void {
    this.toastService.cerrar(id);
  }

  protected ejecutarAccion(toastId: string, onClick: () => void): void {
    onClick();
    this.cerrar(toastId);
  }
}
