import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SvgSinWifi } from '../../svgs/svg-sin-wifi/svg-sin-wifi';
import { ConectividadService } from '../../../services/conectividad.service';

@Component({
  selector: 'app-banner-sin-conexion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SvgSinWifi],
  templateUrl: './banner-sin-conexion.html',
  styleUrl: './banner-sin-conexion.css',
})
export class BannerSinConexion {
  protected readonly conectividad = inject(ConectividadService);
}
