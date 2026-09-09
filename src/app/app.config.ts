import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { errorInterceptor } from './auth/interceptors/error.interceptor';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    // Intenta renovar la sesión con el refresh token de la cookie antes de
    // que se pinte la primera vista — así un F5 no manda al usuario a
    // /login innecesariamente. Falla en silencio si no hay sesión previa.
    provideAppInitializer(() => inject(AuthService).bootstrap()),
    // Solo instancia el service para que aplique [data-theme] desde el
    // primer render — providedIn:'root' no lo crea solo con importarlo.
    provideAppInitializer(() => void inject(ThemeService)),
  ],
};
