// Espejo de los catálogos estáticos de Backend/src/routes/catalogs.routes.ts.
export interface Country {
  id: number;
  isoCode: string;
  name: string;
  flagEmoji: string | null;
}

export interface Timezone {
  id: number;
  ianaName: string;
  utcOffset: string;
  displayName: string;
}
