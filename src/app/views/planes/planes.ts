import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SvgCheck } from '../../components/svgs/svg-check/svg-check';
import { SvgX } from '../../components/svgs/svg-x/svg-x';
import { ErrorApi } from '../../models/auth';
import { EstadoSuscripcion, MiSuscripcion, Plan } from '../../models/billing';
import { BillingService } from '../../services/billing.service';

interface Caracteristica {
  texto: string;
  incluida: boolean;
}

const ETIQUETA_ESTADO: Record<EstadoSuscripcion, string> = {
  ACTIVE: 'Activo',
  TRIALING: 'En prueba',
  PAST_DUE: 'Pago pendiente',
  CANCELED: 'Cancelado',
};

/** Planes y suscripción — por ahora solo lectura: muestra el catálogo real
 * (`GET /billing/plans`) y el plan/consumo del usuario (`GET /me/subscription`).
 * El cambio de plan y el cobro todavía no existen (fuera de alcance, ver
 * docs/07-alcance-mvp.md), así que los botones de contratar están
 * deshabilitados a propósito en vez de fingir un checkout. Ningún límite se
 * hardcodea acá: los textos salen de los entitlements que manda la API. */
@Component({
  selector: 'app-planes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SvgCheck, SvgX],
  templateUrl: './planes.html',
  styleUrl: './planes.css',
})
export class Planes {
  private readonly billingService = inject(BillingService);

  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly planes = signal<Plan[]>([]);
  protected readonly suscripcion = signal<MiSuscripcion | null>(null);

  protected readonly planActual = computed(
    () => this.planes().find((p) => p.code === this.suscripcion()?.planCode) ?? null,
  );

  /** Porcentaje de uso del límite de workspaces (null si es ilimitado). */
  protected readonly porcentajeWorkspaces = computed(() => {
    const uso = this.suscripcion()?.usage;
    if (!uso || uso.workspacesOwnedMax === null || uso.workspacesOwnedMax === 0) return null;
    return Math.min(100, Math.round((uso.workspacesOwned / uso.workspacesOwnedMax) * 100));
  });

  constructor() {
    void this.cargar();
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    try {
      const [planes, suscripcion] = await Promise.all([
        this.billingService.listarPlanes(),
        this.billingService.miSuscripcion(),
      ]);
      this.planes.set(planes);
      this.suscripcion.set(suscripcion);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.cargando.set(false);
    }
  }

  protected esActual(plan: Plan): boolean {
    return plan.code === this.suscripcion()?.planCode;
  }

  protected etiquetaEstado(estado: EstadoSuscripcion): string {
    return ETIQUETA_ESTADO[estado];
  }

  protected fecha(iso: string): string {
    return new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(new Date(iso));
  }

  protected precio(plan: Plan): { monto: string; detalle: string } {
    if (plan.isCustomPricing) return { monto: 'A medida', detalle: 'Precio según tus necesidades' };
    if (plan.priceMonthlyCents === null) return { monto: 'Por definir', detalle: 'Precio aún no publicado' };
    if (plan.priceMonthlyCents === 0) return { monto: '$0', detalle: 'por mes' };
    return { monto: `$${(plan.priceMonthlyCents / 100).toFixed(2)}`, detalle: 'por mes' };
  }

  /** Traduce los entitlements del plan a texto legible. Es solo presentación:
   * los valores vienen de la API. Claves que este mapa no conoce se ignoran. */
  protected caracteristicas(plan: Plan): Caracteristica[] {
    const e = plan.entitlements;
    const lista: Caracteristica[] = [];

    const max = e['workspaces.owned.max'];
    if (max !== undefined) {
      lista.push({
        texto: max === 'unlimited' ? 'Workspaces propios ilimitados' : `Hasta ${max} workspaces propios`,
        incluida: true,
      });
    }
    if (e['storage.personal.enabled'] !== undefined) {
      lista.push({ texto: 'Archivos y fotos personales', incluida: e['storage.personal.enabled'] === 'true' });
    }
    if (e['storage.shared.enabled'] !== undefined) {
      lista.push({ texto: 'Archivos en espacios compartidos', incluida: e['storage.shared.enabled'] === 'true' });
    }
    if (e['customization.level'] !== undefined) {
      lista.push({
        texto: e['customization.level'] === 'advanced' ? 'Personalización avanzada' : 'Personalización básica',
        incluida: true,
      });
    }
    if (e['team.plus.enabled'] !== undefined) {
      lista.push({ texto: 'Extras para equipos grandes', incluida: e['team.plus.enabled'] === 'true' });
    }
    return lista;
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos cargar los planes. Intenta de nuevo.';
  }
}
