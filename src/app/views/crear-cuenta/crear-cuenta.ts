import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CodigosRecuperacion } from '../../components/principales/codigos-recuperacion/codigos-recuperacion';
import { TarjetaAuth } from '../../components/principales/tarjeta-auth/tarjeta-auth';
import { SvgGoogle } from '../../components/svgs/svg-google/svg-google';
import { SvgOjo } from '../../components/svgs/svg-ojo/svg-ojo';
import { SvgOjoCerrado } from '../../components/svgs/svg-ojo-cerrado/svg-ojo-cerrado';
import { ErrorApi, RegistroResultado } from '../../models/auth';
import { AuthService } from '../../services/auth.service';

function contrasenasCoinciden(grupo: AbstractControl): ValidationErrors | null {
  const password = grupo.get('password')?.value;
  const confirmacion = grupo.get('confirmacion')?.value;
  return password === confirmacion ? null : { contrasenasDistintas: true };
}

@Component({
  selector: 'app-crear-cuenta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TarjetaAuth,
    CodigosRecuperacion,
    SvgGoogle,
    SvgOjo,
    SvgOjoCerrado,
  ],
  templateUrl: './crear-cuenta.html',
})
export class CrearCuenta {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly resultado = signal<RegistroResultado | null>(null);
  protected readonly mostrarPassword = signal(false);
  protected readonly mostrarConfirmacion = signal(false);

  protected readonly formulario = this.fb.nonNullable.group(
    {
      displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      confirmacion: ['', [Validators.required]],
    },
    { validators: contrasenasCoinciden },
  );

  protected async enviar(): Promise<void> {
    if (this.formulario.invalid || this.enviando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMensaje.set(null);

    try {
      const { confirmacion: _confirmacion, ...input } = this.formulario.getRawValue();
      const resultado = await this.authService.register(input);
      this.resultado.set(resultado);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.enviando.set(false);
    }
  }

  protected alternarMostrarPassword(): void {
    this.mostrarPassword.update((actual) => !actual);
  }

  protected alternarMostrarConfirmacion(): void {
    this.mostrarConfirmacion.update((actual) => !actual);
  }

  protected continuar(): void {
    void this.router.navigateByUrl('/login');
  }

  protected continuarConGoogle(): void {
    // Navegación de página completa — Google/Supabase decide si esto
    // termina creando una cuenta nueva o iniciando sesión en una existente;
    // el resto del flujo sigue en /auth/callback, no en esta vista.
    this.authService.continuarConGoogle();
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos crear tu cuenta. Intenta de nuevo.';
  }
}
