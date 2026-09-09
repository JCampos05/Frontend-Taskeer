import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ErrorApi } from '../../models/auth';
import { Country, Timezone } from '../../models/catalog';
import { Tema } from '../../models/preferences';
import { AuthService } from '../../services/auth.service';
import { CatalogsService } from '../../services/catalogs.service';
import { PreferencesService } from '../../services/preferences.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-configuracion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly catalogsService = inject(CatalogsService);

  protected readonly paises = signal<Country[]>([]);
  protected readonly zonasHorarias = signal<Timezone[]>([]);
  protected readonly cargandoCatalogos = signal(true);
  protected readonly guardandoRegion = signal(false);
  protected readonly regionGuardada = signal(false);
  protected readonly guardandoPerfil = signal(false);
  protected readonly perfilGuardado = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly reenviandoVerificacion = signal(false);
  protected readonly verificacionReenviada = signal(false);
  // Solo se llena en desarrollo (sin proveedor de correo confiable — ver
  // docs/01-arquitectura.md) para poder verificar sin depender de que el
  // correo real llegue.
  protected readonly tokenVerificacionDev = signal<string | null>(null);

  protected readonly formularioRegion = this.fb.group({
    countryId: this.fb.control<number | null>(null),
    timezoneId: this.fb.control<number | null>(null),
  });

  protected readonly formularioPerfil = this.fb.nonNullable.group({
    displayName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
  });

  constructor() {
    void this.cargarTodo();

    const usuario = this.authService.usuarioActual();
    if (usuario) {
      this.formularioPerfil.setValue({ displayName: usuario.displayName });
    }
  }

  private async cargarTodo(): Promise<void> {
    this.cargandoCatalogos.set(true);
    try {
      const [paises, zonas, preferences] = await Promise.all([
        this.catalogsService.listarPaises(),
        this.catalogsService.listarZonasHorarias(),
        this.preferencesService.cargar(),
      ]);
      this.paises.set(paises);
      this.zonasHorarias.set(zonas);
      this.formularioRegion.setValue({
        countryId: preferences.countryId,
        timezoneId: preferences.timezoneId,
      });
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.cargandoCatalogos.set(false);
    }
  }

  protected async guardarPerfil(): Promise<void> {
    if (this.formularioPerfil.invalid || this.guardandoPerfil()) {
      this.formularioPerfil.markAllAsTouched();
      return;
    }

    this.guardandoPerfil.set(true);
    this.errorMensaje.set(null);
    this.perfilGuardado.set(false);

    try {
      await this.authService.updateProfile(this.formularioPerfil.getRawValue().displayName);
      this.perfilGuardado.set(true);
      setTimeout(() => this.perfilGuardado.set(false), 2500);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.guardandoPerfil.set(false);
    }
  }

  protected async reenviarVerificacion(): Promise<void> {
    if (this.reenviandoVerificacion()) return;

    this.reenviandoVerificacion.set(true);
    this.errorMensaje.set(null);
    this.verificacionReenviada.set(false);
    this.tokenVerificacionDev.set(null);

    try {
      const resultado = await this.authService.resendVerification();
      this.verificacionReenviada.set(true);
      this.tokenVerificacionDev.set(resultado.emailVerificationToken ?? null);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.reenviandoVerificacion.set(false);
    }
  }

  protected async elegirTema(tema: Tema): Promise<void> {
    this.themeService.establecerTema(tema);
    try {
      await this.preferencesService.actualizar({ theme: tema });
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    }
  }

  protected async guardarRegion(): Promise<void> {
    if (this.guardandoRegion()) return;

    this.guardandoRegion.set(true);
    this.errorMensaje.set(null);
    this.regionGuardada.set(false);

    try {
      await this.preferencesService.actualizar(this.formularioRegion.getRawValue());
      this.regionGuardada.set(true);
      setTimeout(() => this.regionGuardada.set(false), 2500);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.guardandoRegion.set(false);
    }
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos completar la operación. Intenta de nuevo.';
  }
}
