import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TarjetaAuth } from '../../components/principales/tarjeta-auth/tarjeta-auth';
import { SvgOjo } from '../../components/svgs/svg-ojo/svg-ojo';
import { SvgOjoCerrado } from '../../components/svgs/svg-ojo-cerrado/svg-ojo-cerrado';
import { ErrorApi } from '../../models/auth';
import { AuthService } from '../../services/auth.service';

function contrasenasCoinciden(grupo: AbstractControl): ValidationErrors | null {
  const password = grupo.get('newPassword')?.value;
  const confirmacion = grupo.get('confirmacion')?.value;
  return password === confirmacion ? null : { contrasenasDistintas: true };
}

/** Reset de contraseña con código de recuperación — no es un flujo de dos
 * pasos por correo (no hay ningún link que llegue por email): el usuario ya
 * tiene sus 10 códigos guardados desde el registro, así que el formulario
 * pide todo junto (correo + código + contraseña nueva) en una sola
 * request, ver Backend/src/modules/auth/auth.service.ts::resetPasswordWithCode. */
@Component({
  selector: 'app-restablecer-contrasena',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TarjetaAuth, SvgOjo, SvgOjoCerrado],
  templateUrl: './restablecer-contrasena.html',
})
export class RestablecerContrasena {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly completado = signal(false);
  protected readonly mostrarPassword = signal(false);
  protected readonly mostrarConfirmacion = signal(false);

  protected readonly formulario = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
      confirmacion: ['', [Validators.required]],
    },
    { validators: contrasenasCoinciden },
  );

  protected alternarMostrarPassword(): void {
    this.mostrarPassword.update((actual) => !actual);
  }

  protected alternarMostrarConfirmacion(): void {
    this.mostrarConfirmacion.update((actual) => !actual);
  }

  protected async enviar(): Promise<void> {
    if (this.formulario.invalid || this.enviando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorMensaje.set(null);

    try {
      const { confirmacion: _confirmacion, ...input } = this.formulario.getRawValue();
      await this.authService.resetPasswordWithCode(input);
      this.completado.set(true);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.enviando.set(false);
    }
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos restablecer tu contraseña. Intenta de nuevo.';
  }
}
