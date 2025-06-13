import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/../convex/_generated/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Package, ShoppingBag, Users, BarChart3 } from 'lucide-react'
import { ChartAreaInteractive } from '@/components/features/charts/chart-area-interactive'
import { SectionCards } from '@/components/features/charts/section-cards'
import { convexQuery } from '@convex-dev/react-query'

export const Route = createFileRoute('/_authed/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { data: productsData } = useQuery(
    convexQuery(api.products.getProductsByCategory, {}),
  )

  const totalProducts = productsData
    ? (productsData.bagels?.length || 0) +
      (productsData.drinks?.length || 0) +
      (productsData.sides?.length || 0)
    : 0

  return (
    <div className="space-y-6">
      <SectionCards />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>
              Performance metrics for the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartAreaInteractive />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key business metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Products</span>
              </div>
              <span className="text-2xl font-bold">{totalProducts}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Orders Today</span>
              </div>
              <span className="text-2xl font-bold">0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Revenue (Month)</span>
              </div>
              <span className="text-2xl font-bold">$0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Active Admins</span>
              </div>
              <span className="text-2xl font-bold">1</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 text-center py-8">
            No recent activity to display. Start by managing your products or
            viewing orders.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
