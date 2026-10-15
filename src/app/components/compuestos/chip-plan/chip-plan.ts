import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgDiamante } from '../../svgs/svg-diamante/svg-diamante';
import { AuthService } from '../../../services/auth.service';
import { BillingService } from '../../../services/billing.service';
import { WorkspacesService } from '../../../services/workspaces.service';

/** Acceso a /app/planes desde el pie del sidebar: muestra el plan actual y el
 * consumo de workspaces propios. El conteo sale de la lista de workspaces ya
 * cargada (se actualiza al crear uno); el límite y el nombre del plan, de
 * `GET /me/subscription`. Si la suscripción no cargó, igual enlaza a Planes. */
@Component({
  selector: 'app-chip-plan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SvgDiamante],
  templateUrl: './chip-plan.html',
  styleUrl: './chip-plan.css',
})
export class ChipPlan {
  private readonly billingService = inject(BillingService);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly authService = inject(AuthService);

  protected readonly suscripcion = this.billingService.suscripcionActual;

  protected readonly propios = computed(() => {
    const miId = this.authService.usuarioActual()?.id;
    return this.workspacesService.workspacesConocidos().filter((w) => w.ownerId === miId).length;
  });

  protected readonly maximo = computed(() => this.suscripcion()?.usage.workspacesOwnedMax ?? null);

  protected readonly porcentaje = computed(() => {
    const max = this.maximo();
    if (max === null || max === 0) return null;
    return Math.min(100, Math.round((this.propios() / max) * 100));
  });

  constructor() {
    // Best-effort: sin la suscripción el chip muestra solo "Planes".
    void this.billingService.miSuscripcion().catch(() => undefined);
  }
}
