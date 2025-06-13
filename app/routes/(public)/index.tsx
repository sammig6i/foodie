// app/routes/(public)/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api' // Adjust path as needed
import { useState, useEffect } from 'react'
import CategorySidebar from '@/components/public/CategorySidebar'
import MenuItemCard from '@/components/public/MenuItemCard'
import { Skeleton } from '@/components/ui/skeleton' // Assuming Shadcn UI Skeleton
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectValue,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

export const Route = createFileRoute('/(public)/')({
  component: HomePage,
})

function HomePage() {
  const productsData = useQuery(api.products.getProductsByCategory, {})
  const batchOptionsData = useQuery(api.products.getBatchOptions, {})
  const categoriesData = useQuery(api.products.getAvailableCategories, {})

  const [selectedCategory, setSelectedCategory] = useState('bagels')

  const categories = categoriesData || []

  const isLoading =
    productsData === undefined ||
    batchOptionsData === undefined ||
    categoriesData === undefined

  const getProductsForCategory = () => {
    if (!productsData) return []
    switch (selectedCategory) {
      case 'bagels':
        return productsData.bagels
      case 'drinks':
        return productsData.drinks
      case 'sides':
        return productsData.sides
      default:
        return []
    }
  }

  const currentProducts = getProductsForCategory()

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <div className="flex-1">
        <section className="mb-12">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {[...Array(6)].map(
                (
                  _,
                  i, // Show 6 skeleton loaders
                ) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden flex flex-col"
                  >
                    <Skeleton className="w-full h-56" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : currentProducts && currentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {currentProducts.map((product) => (
                <MenuItemCard
                  key={product._id}
                  product={product}
                  batchOptions={
                    product.category === 'bagels' ? batchOptionsData : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No {selectedCategory} available at the moment. Please check back
              later!
            </p>
          )}
        </section>

        {/* Add Mix & Match item */}
      </div>
    </div>
  )
}
