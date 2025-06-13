import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Shield, User, AlertTriangle } from 'lucide-react'
import { SignIn, SignedIn, SignedOut, useUser } from '@clerk/tanstack-start'

export const Route = createFileRoute('/(public)/setup-admin')({
  component: SetupAdminPage,
})

function SetupAdminPage() {
  const { user } = useUser()
  const currentUser = useQuery(api.auth.getCurrentUser)
  const isAdmin = useQuery(api.auth.isAdmin)
  const createTestAdmin = useMutation(api.auth.createTestAdmin)

  const handleCreateTestAdmin = async () => {
    if (!currentUser?.id) return

    try {
      await createTestAdmin({ userId: currentUser.id })
      alert('Admin access granted! You can now access /admin')
      window.location.href = '/admin'
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Setup</h1>
          <p className="text-gray-600 mt-2">
            Development environment admin configuration
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Development Only
            </CardTitle>
            <CardDescription>
              This page is for development setup only. In production, admin
              access should be managed through your admin panel.
            </CardDescription>
          </CardHeader>
        </Card>

        <SignedOut>
          <Card>
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to set up admin access for development.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignIn
                routing="hash"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                    card: 'shadow-none border-0',
                  },
                }}
              />
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Current User
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentUser ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {currentUser.name.toString()}
                    </p>
                    <p>
                      <strong>Email:</strong> {currentUser.email}
                    </p>
                    <p>
                      <strong>User ID:</strong> {currentUser.id}
                    </p>
                    <p>
                      <strong>Admin Status:</strong>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          isAdmin
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isAdmin ? 'Admin' : 'Not Admin'}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Loading user information...</p>
                )}
              </CardContent>
            </Card>

            {currentUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Grant Admin Access</CardTitle>
                  <CardDescription>
                    {isAdmin
                      ? 'You already have admin access. You can visit the admin dashboard.'
                      : 'Click the button below to grant yourself admin access for development.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAdmin ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800 text-sm">
                          ✅ Admin access is already configured for your
                          account.
                        </p>
                      </div>
                      <Button
                        onClick={() => (window.location.href = '/admin')}
                        className="w-full"
                      >
                        Go to Admin Dashboard
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-yellow-800 text-sm">
                          ⚠️ This will add your current user account to the
                          admin list. Only use this in development.
                        </p>
                      </div>
                      <Button
                        onClick={handleCreateTestAdmin}
                        className="w-full"
                        variant="outline"
                      >
                        Grant Admin Access
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Ensure you're signed in with your development account</li>
                  <li>
                    Click "Grant Admin Access" to add yourself as an admin
                  </li>
                  <li>
                    Navigate to{' '}
                    <code className="bg-gray-100 px-1 rounded">/admin</code> to
                    access the dashboard
                  </li>
                  <li>
                    The admin dashboard will now be accessible to your account
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </SignedIn>
      </div>
    </div>
  )
}
