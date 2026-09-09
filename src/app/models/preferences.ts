// Espejo de PreferencesDto (Backend/src/modules/preferences/preferences.types.ts).
export type Tema = 'LIGHT' | 'DARK' | 'AUTO';

export interface Preferences {
  countryId: number | null;
  timezoneId: number | null;
  theme: Tema;
  language: string;
  isPersisted: boolean;
  updatedAt: string | null;
}

export interface UpdatePreferencesInput {
  theme?: Tema;
  language?: string;
  countryId?: number | null;
  timezoneId?: number | null;
}
