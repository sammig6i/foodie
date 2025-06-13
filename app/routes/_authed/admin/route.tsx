import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/../convex/_generated/api'
import { SignIn } from '@clerk/tanstack-start'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ThemeProvider } from '@/components/common/theme-provider'
import { NotFound } from '@/components/common/NotFound'
import { convexQuery } from '@convex-dev/react-query'

export const Route = createFileRoute('/_authed/admin')({
  component: AdminLayoutComponent,
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw new Error('Not authenticated')
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="max-w-md w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Admin Access Required
              </h2>
              <p className="text-muted-foreground">
                Please sign in with your admin credentials to access the
                dashboard.
              </p>
            </div>
            <SignIn
              routing="hash"
              forceRedirectUrl={window.location.href}
              appearance={{
                elements: {
                  formButtonPrimary:
                    'bg-primary hover:bg-primary/90 text-primary-foreground',
                  card: 'shadow-lg bg-card border-border',
                },
              }}
            />
          </div>
        </div>
      )
    }

    if (error.message === 'Not authorized') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center border">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 6.5c-.77.833-.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the admin dashboard. Please
              contact an administrator if you believe this is an error.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Return to Home
            </a>
          </div>
        </div>
      )
    }

    throw error
  },
  notFoundComponent: () => <NotFound />,
})

function AdminLayoutComponent() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AdminContent />
    </ThemeProvider>
  )
}

function AdminContent() {
  const adminUser = useQuery(convexQuery(api.auth.getAdminUser, {}))

  if (adminUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary"></div>
          <p className="text-muted-foreground text-sm">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (adminUser === null) {
    throw new Error('Not authorized')
  }

  return (
    <div className="[--header-height:theme(spacing.14)]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
