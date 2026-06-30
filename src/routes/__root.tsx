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
      { rel: "manifest", href: "/manifest.webmanifest" },
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
    </QueryClientProvider>
  );
}
