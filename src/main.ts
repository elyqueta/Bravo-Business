import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { AppComponent } from "./app/app.component";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { routes } from "./app/app.routes";
import { authInterceptor } from "./app/core/auth.interceptor";
import { sessionInterceptor } from "./app/core/session.interceptor";
import { refreshInterceptor } from "./app/core/refresh.interceptor";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: "top" }),
    ),
    provideHttpClient(withInterceptors([authInterceptor, sessionInterceptor, refreshInterceptor])),
  ],
}).catch((error: unknown) => console.error(error));
