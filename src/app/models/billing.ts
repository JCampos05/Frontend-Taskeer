// Espejos de los DTOs de Backend/src/modules/billing/billing.types.ts.

export type EstadoSuscripcion = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';

export interface Plan {
  code: string;
  name: string;
  description: string | null;
  // null = sin precio definido todavía (o precio personalizado).
  priceMonthlyCents: number | null;
  isCustomPricing: boolean;
  // clave → valor en texto: "true"/"false", un entero, o "unlimited".
  entitlements: Record<string, string>;
}

export interface MiSuscripcion {
  planCode: string;
  planName: string;
  effectivePlanCode: string;
  status: EstadoSuscripcion;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  downgradeGraceEndsAt: string | null;
  usage: {
    workspacesOwned: number;
    // null = ilimitado.
    workspacesOwnedMax: number | null;
  };
}
