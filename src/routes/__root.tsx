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
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gold-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md btn-neon hover:btn-neon-hover px-4 py-2 text-sm">
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
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md btn-neon hover:btn-neon-hover px-4 py-2 text-sm"
          >
            Try again
          </button>
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
      { title: "Zarb Ul Hadeed CXVII — Unit Personnel Management Suite" },
      { name: "description", content: "Secure, offline-first personnel management for military units. Parade tree, roster, movement history, analytics and PDF/CSV reports — built for the field." },
      { property: "og:title", content: "Zarb Ul Hadeed CXVII — Unit Personnel Management Suite" },
      { property: "og:description", content: "Secure, offline-first personnel management for military units. Parade tree, roster, movement history, analytics and PDF/CSV reports — built for the field." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Zarb Ul Hadeed CXVII — Unit Personnel Management Suite" },
      { name: "twitter:description", content: "Secure, offline-first personnel management for military units. Parade tree, roster, movement history, analytics and PDF/CSV reports — built for the field." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='light')document.documentElement.classList.add('light');else document.documentElement.classList.remove('light');}catch(e){document.documentElement.classList.remove('light');}})();",
          }}
        />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster
        position="top-right"
        theme="dark"
        expand
        gap={10}
        offset={20}
        duration={4500}
        toastOptions={{
          unstyled: false,
          classNames: {
            toast:
              "!bg-[hsl(150_40%_6%)]/95 !backdrop-blur-xl !border !border-[hsl(45_70%_52%)]/25 !text-foreground !shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6),0_0_0_1px_rgba(212,175,55,0.08)] !rounded-lg !p-4 !gap-3 !font-sans",
            title: "!text-[0.925rem] !font-semibold !tracking-tight !text-[hsl(45_75%_70%)] !leading-snug",
            description: "!text-[0.8125rem] !text-muted-foreground !leading-relaxed !mt-0.5",
            icon: "!text-[hsl(45_70%_52%)]",
            actionButton:
              "!bg-[hsl(45_70%_52%)] !text-[hsl(150_40%_6%)] !font-semibold !text-xs !px-3 !py-1.5 !rounded-md !tracking-wide hover:!bg-[hsl(45_75%_58%)] !transition-colors",
            cancelButton:
              "!bg-transparent !text-muted-foreground !border !border-border/60 !text-xs !px-3 !py-1.5 !rounded-md hover:!bg-muted/40 !transition-colors",
            closeButton:
              "!bg-[hsl(150_40%_6%)] !border !border-[hsl(45_70%_52%)]/30 !text-[hsl(45_70%_52%)] hover:!bg-[hsl(45_70%_52%)]/10",
            success: "!border-[hsl(45_70%_52%)]/30",
            error: "!border-red-500/40",
            warning: "!border-amber-500/40",
            info: "!border-[hsl(45_70%_52%)]/25",
          },
        }}
      />
    </QueryClientProvider>
  );
}
