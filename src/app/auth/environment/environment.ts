// Config de build (URLs de API, flags) — vive en auth/environment/ por
// decisión explícita del usuario (ver docs/06-frontend.md), no es la
// ubicación por defecto de los schematics de Angular.
//
// Este archivo son los valores de PRODUCCIÓN. Para desarrollo,
// angular.json reemplaza este archivo por environment.development.ts vía
// fileReplacements en la configuración "development".

export const environment = {
  production: true,
  apiUrl: 'https://TODO-configurar-url-de-render.onrender.com/api/v1',
};
