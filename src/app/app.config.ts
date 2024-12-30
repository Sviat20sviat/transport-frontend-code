import { ApplicationConfig, LOCALE_ID, importProvidersFrom, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/http.interceptor';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';
import { provideServiceWorker } from '@angular/service-worker';
// import { provideYConfig, YConfig } from 'angular-yandex-maps-v3';

// const config: YConfig = {
//   apikey: 'abeb35e1-d8ef-4e4d-9cdb-e89c194bf8ad',
// };

registerLocaleData(localeRu);
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideAnimationsAsync(),
    provideAnimations(),
    importProvidersFrom(MatNativeDateModule),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: CommonModule,
      useClass: CommonModule
    },
    { provide: LOCALE_ID, useValue: 'ru' }, provideAnimationsAsync(), provideAnimationsAsync(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode()
          }),
    // provideYConfig(config)
  ]
};
