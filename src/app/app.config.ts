import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),       // Omogućava rad ApiService-a
    provideAnimations(),       // Potrebno za Toastr
    provideToastr({            // Konfiguracija notifikacija
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }) 
  ]
};