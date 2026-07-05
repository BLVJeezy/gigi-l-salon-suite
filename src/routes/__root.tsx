import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GiGi L Coiffure — Salon de coiffure à Tongres" },
      { name: "description", content: "Salon de coiffure africaine et européenne à Tongres : tresses, tissage, locks, microshading, ongles et perruques. Spécialiste des cheveux bouclés, frisés et crépus." },
      { name: "author", content: "GiGi L Coiffure" },
      { name: "robots", content: "index, follow" },
      { name: "google-site-verification", content: "google67e1cbdf934e290c" },
      { property: "og:title", content: "GiGi L Coiffure — Salon de coiffure à Tongres" },
      { property: "og:description", content: "Salon de coiffure africaine et européenne à Tongres : tresses, tissage, locks, microshading, ongles et perruques. Spécialiste des cheveux bouclés, frisés et crépus." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "GiGi L Coiffure" },
      { property: "og:locale", content: "fr_BE" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GiGi L Coiffure — Salon de coiffure à Tongres" },
      { name: "twitter:description", content: "Salon de coiffure africaine et européenne à Tongres : tresses, tissage, locks, microshading, ongles et perruques. Spécialiste des cheveux bouclés, frisés et crépus." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/KEDrZiSgTKMYP8FoeMobg1nITP92/social-images/social-1782781438691-Screenshot_2026-06-30_at_03.03.46.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/KEDrZiSgTKMYP8FoeMobg1nITP92/social-images/social-1782781438691-Screenshot_2026-06-30_at_03.03.46.webp" },
      { name: "apple-mobile-web-app-title", content: "GIGI L" },
      { name: "application-name", content: "GIGI L" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "theme-color", content: "#0E0D0B" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/__l5e/assets-v1/f589b0f0-41a7-4742-bb16-f8f2b65ab4bd/gigil-logo.png" },
      { rel: "shortcut icon", type: "image/png", href: "/__l5e/assets-v1/f589b0f0-41a7-4742-bb16-f8f2b65ab4bd/gigil-logo.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/__l5e/assets-v1/f589b0f0-41a7-4742-bb16-f8f2b65ab4bd/gigil-logo.png" },
      // Note: manifest link is set per-route (index uses /manifest.webmanifest, admin uses /manifest-admin.webmanifest) so installs scope correctly.
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Marcellus&family=Jost:wght@300;400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      {/* Floating WhatsApp button — hidden on admin */}
      <a
        href="https://wa.me/32484164905"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp GiGi L Coiffure"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        style={{ background: "#25D366" }}
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.541 5.875L.057 23.882l6.184-1.622A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.028-1.384l-.36-.214-3.733.979.999-3.645-.234-.374A9.818 9.818 0 0112 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/>
        </svg>
      </a>
    </QueryClientProvider>
  );
}
