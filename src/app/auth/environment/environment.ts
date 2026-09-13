const production = true; // Cambia esto a true para usar la URL de producción

export const environment = {
  production: production,
  apiUrl: production
    ? 'https://backend-taskeerv3-preproduction.onrender.com/api/v1' // URL de producción
    : 'http://localhost:3100/api/v1', // URL de desarrollo
};
