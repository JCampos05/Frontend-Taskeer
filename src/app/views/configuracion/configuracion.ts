import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CodigosRecuperacion } from '../../components/principales/codigos-recuperacion/codigos-recuperacion';
import { SvgCandado } from '../../components/svgs/svg-candado/svg-candado';
import { SvgCheck } from '../../components/svgs/svg-check/svg-check';
import { SvgCopiar } from '../../components/svgs/svg-copiar/svg-copiar';
import { SvgOjo } from '../../components/svgs/svg-ojo/svg-ojo';
import { SvgOjoCerrado } from '../../components/svgs/svg-ojo-cerrado/svg-ojo-cerrado';
import { SvgPersona } from '../../components/svgs/svg-persona/svg-persona';
import { SvgReloj } from '../../components/svgs/svg-reloj/svg-reloj';
import { SvgSol } from '../../components/svgs/svg-sol/svg-sol';
import { ErrorApi } from '../../models/auth';
import { Country, Timezone } from '../../models/catalog';
import { Tema } from '../../models/preferences';
import { AuthService } from '../../services/auth.service';
import { CatalogsService } from '../../services/catalogs.service';
import { PreferencesService } from '../../services/preferences.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';

function contrasenasCoinciden(grupo: AbstractControl): ValidationErrors | null {
  const password = grupo.get('newPassword')?.value;
  const confirmacion = grupo.get('confirmacion')?.value;
  return password === confirmacion ? null : { contrasenasDistintas: true };
}

@Component({
  selector: 'app-configuracion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CodigosRecuperacion,
    SvgCheck,
    SvgCopiar,
    SvgPersona,
    SvgSol,
    SvgReloj,
    SvgCandado,
    SvgOjo,
    SvgOjoCerrado,
  ],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly catalogsService = inject(CatalogsService);
  private readonly toastService = inject(ToastService);

  protected readonly paises = signal<Country[]>([]);
  protected readonly zonasHorarias = signal<Timezone[]>([]);
  protected readonly cargandoCatalogos = signal(true);
  protected readonly guardandoRegion = signal(false);
  protected readonly guardandoPerfil = signal(false);
  protected readonly correoCopiado = signal(false);
  protected readonly reenviandoVerificacion = signal(false);
  protected readonly verificacionReenviada = signal(false);
  // Solo se llena en desarrollo (sin proveedor de correo confiable — ver
  // docs/01-arquitectura.md) para poder verificar sin depender de que el
  // correo real llegue.
  protected readonly tokenVerificacionDev = signal<string | null>(null);

  protected readonly cambiandoContrasena = signal(false);
  protected readonly mostrarContrasenaActual = signal(false);
  protected readonly mostrarContrasenaNueva = signal(false);
  protected readonly mostrarConfirmacionNueva = signal(false);

  protected readonly regenerandoCodigos = signal(false);
  protected readonly mostrarContrasenaRegenerar = signal(false);
  protected readonly codigosRegenerados = signal<string[] | null>(null);

  protected readonly formularioRegion = this.fb.group({
    countryId: this.fb.control<number | null>(null),
    timezoneId: this.fb.control<number | null>(null),
  });

  protected readonly formularioPerfil = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  protected readonly formularioContrasena = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      confirmacion: ['', [Validators.required]],
    },
    { validators: contrasenasCoinciden },
  );

  protected readonly formularioRegenerarCodigos = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
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
      this.toastService.error(this.obtenerMensajeError(err));
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

    try {
      await this.authService.updateProfile(this.formularioPerfil.getRawValue().displayName);
      this.toastService.exito('Nombre actualizado.');
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.guardandoPerfil.set(false);
    }
  }

  protected async copiarCorreo(): Promise<void> {
    const email = this.authService.usuarioActual()?.email;
    if (!email) return;

    await navigator.clipboard.writeText(email);
    this.correoCopiado.set(true);
    setTimeout(() => this.correoCopiado.set(false), 2000);
  }

  protected async reenviarVerificacion(): Promise<void> {
    if (this.reenviandoVerificacion()) return;

    this.reenviandoVerificacion.set(true);
    this.verificacionReenviada.set(false);
    this.tokenVerificacionDev.set(null);

    try {
      const resultado = await this.authService.resendVerification();
      this.verificacionReenviada.set(true);
      this.tokenVerificacionDev.set(resultado.emailVerificationToken ?? null);
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.reenviandoVerificacion.set(false);
    }
  }

  protected async elegirTema(tema: Tema): Promise<void> {
    this.themeService.establecerTema(tema);
    try {
      await this.preferencesService.actualizar({ theme: tema });
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    }
  }

  protected async guardarRegion(): Promise<void> {
    if (this.guardandoRegion()) return;

    this.guardandoRegion.set(true);

    try {
      await this.preferencesService.actualizar(this.formularioRegion.getRawValue());
      this.toastService.exito('Región actualizada.');
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.guardandoRegion.set(false);
    }
  }

  protected alternarMostrarContrasenaActual(): void {
    this.mostrarContrasenaActual.update((actual) => !actual);
  }

  protected alternarMostrarContrasenaNueva(): void {
    this.mostrarContrasenaNueva.update((actual) => !actual);
  }

  protected alternarMostrarConfirmacionNueva(): void {
    this.mostrarConfirmacionNueva.update((actual) => !actual);
  }

  protected alternarMostrarContrasenaRegenerar(): void {
    this.mostrarContrasenaRegenerar.update((actual) => !actual);
  }

  protected async cambiarContrasena(): Promise<void> {
    if (this.formularioContrasena.invalid || this.cambiandoContrasena()) {
      this.formularioContrasena.markAllAsTouched();
      return;
    }

    this.cambiandoContrasena.set(true);

    try {
      const { confirmacion: _confirmacion, ...input } = this.formularioContrasena.getRawValue();
      await this.authService.changePassword(input);
      this.formularioContrasena.reset({ currentPassword: '', newPassword: '', confirmacion: '' });
      this.toastService.exito('Contraseña actualizada. Cerramos tus otras sesiones activas.');
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.cambiandoContrasena.set(false);
    }
  }

  protected async regenerarCodigos(): Promise<void> {
    if (this.formularioRegenerarCodigos.invalid || this.regenerandoCodigos()) {
      this.formularioRegenerarCodigos.markAllAsTouched();
      return;
    }

    this.regenerandoCodigos.set(true);

    try {
      const resultado = await this.authService.regenerateRecoveryCodes(
        this.formularioRegenerarCodigos.getRawValue(),
      );
      this.codigosRegenerados.set(resultado.recoveryCodes);
      this.formularioRegenerarCodigos.reset({ currentPassword: '' });
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.regenerandoCodigos.set(false);
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
