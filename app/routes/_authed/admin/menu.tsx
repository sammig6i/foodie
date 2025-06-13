import { createFileRoute } from '@tanstack/react-router'
import { MenuDataTable } from '@/components/features/data-tables/menu-data-table'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { toast } from 'sonner'
import { type ProductFormData } from '@/lib/product-form-schema'
import { type Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/_authed/admin/menu')({
  component: MenuComponent,
})

function MenuComponent() {
  const { data: productsData, isPending } = useQuery(
    convexQuery(api.products.getAllProducts, {}),
  )

  const { data: categories } = useQuery(
    convexQuery(api.products.getAvailableCategories, {}),
  )

  const { data: statuses } = useQuery(
    convexQuery(api.products.getAvailableStatuses, {}),
  )

  const generateUploadUrlMutation = useMutation({
    mutationFn: useConvexMutation(api.products.generateUploadUrl),
  })

  const addProductMutation = useMutation({
    mutationFn: useConvexMutation(api.products.addProduct),
    onSuccess: () => {
      toast.success('Product added successfully')
    },
    onError: () => {
      toast.error('Failed to add product')
    },
  })

  const handleAddProduct = async (data: ProductFormData) => {
    let imageId: Id<'_storage'> | undefined = undefined

    if (data.imageFile) {
      try {
        const uploadUrl = await generateUploadUrlMutation.mutateAsync({})
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': data.imageFile.type },
          body: data.imageFile,
        })
        const response = await result.json()
        imageId = response.storageId as Id<'_storage'>
      } catch (error) {
        throw new Error('Failed to upload image')
      }
    }

    return await addProductMutation.mutateAsync({
      name: data.name,
      category: data.category,
      price: data.price,
      description: data.description ?? undefined,
      available: data.available,
      imageId,
    })
  }

  const updateProductMutation = useMutation({
    mutationFn: useConvexMutation(
      api.products.updateProduct,
    ).withOptimisticUpdate((localStore, args) => {
      const existingProducts = localStore.getQuery(
        api.products.getAllProducts,
        {},
      )
      if (existingProducts !== undefined) {
        const { productId, ...updateFields } = args

        const filteredUpdateFields: any = {}
        for (const [key, value] of Object.entries(updateFields)) {
          if (value !== undefined) {
            filteredUpdateFields[key] = value
          }
        }

        const updatedProducts = existingProducts.map((product) =>
          product._id === productId
            ? ({ ...product, ...filteredUpdateFields } as typeof product)
            : product,
        )
        localStore.setQuery(api.products.getAllProducts, {}, updatedProducts)
      }
    }),
    onSuccess: (result, variables) => {
      const { productId, ...updateFields } = variables
      const changedFieldsCount = Object.keys(updateFields).filter(
        (key) => updateFields[key as keyof typeof updateFields] !== undefined,
      ).length

      if (changedFieldsCount > 0) {
        toast.success('Product updated successfully')
      } else {
        toast.info('No changes were made')
      }
    },
    onError: (error) => {
      console.error('Failed to update product:', error)
      toast.error('Failed to update product')
    },
  })

  const handleUpdateProduct = async (
    data: ProductFormData & { productId: string },
  ) => {
    let imageId: Id<'_storage'> | null | undefined = undefined

    if (data.imageFile) {
      try {
        const uploadUrl = await generateUploadUrlMutation.mutateAsync({})
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': data.imageFile.type },
          body: data.imageFile,
        })
        const response = await result.json()
        imageId = response.storageId as Id<'_storage'>
      } catch (error) {
        throw new Error('Failed to upload image')
      }
    } else if (data.imageId === null) {
      imageId = null
    }

    const updateFields: any = {}

    if (data.name !== undefined) updateFields.name = data.name
    if (data.category !== undefined) updateFields.category = data.category
    if (data.price !== undefined) updateFields.price = data.price
    if (data.description !== undefined)
      updateFields.description = data.description ?? undefined
    if (data.available !== undefined) updateFields.available = data.available
    if (imageId !== undefined) updateFields.imageId = imageId

    return await updateProductMutation.mutateAsync({
      productId: data.productId as Id<'products'>,
      ...updateFields,
    })
  }

  const updateAvailabilityMutation = useMutation({
    mutationFn: useConvexMutation(
      api.products.updateAvailability,
    ).withOptimisticUpdate((localStore, args) => {
      const existingProducts = localStore.getQuery(
        api.products.getAllProducts,
        {},
      )
      if (existingProducts !== undefined) {
        const { productId, available } = args
        const updatedProducts = existingProducts.map((product) =>
          product._id === productId
            ? ({ ...product, available } as typeof product)
            : product,
        )
        localStore.setQuery(api.products.getAllProducts, {}, updatedProducts)
      }
    }),
    onSuccess: (result, variables) => {
      const { productId, available } = variables
      if (available) {
        toast.success('Product enabled successfully')
      } else {
        toast.success('Product disabled successfully')
      }
    },
    onError: () => {
      toast.error('Failed to update availability')
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: useConvexMutation(api.products.deleteProduct),
    onSuccess: () => {
      toast.success('Product deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete product')
    },
  })

  const bulkDeleteProductsMutation = useMutation({
    mutationFn: useConvexMutation(api.products.bulkDeleteProducts),
    onSuccess: (result: { deletedCount: number; failedCount: number }) => {
      if (result.failedCount > 0) {
        toast.success(
          `${result.deletedCount} products deleted successfully. ${result.failedCount} failed to delete.`,
        )
      } else {
        toast.success(`${result.deletedCount} products deleted successfully`)
      }
    },
    onError: () => {
      toast.error('Failed to delete products')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <p className="text-muted-foreground">
          Manage your products, pricing, and availability
        </p>
      </div>
      <MenuDataTable
        data={productsData}
        categories={categories}
        statuses={statuses}
        isPending={isPending}
        mutations={{
          addProduct: { mutateAsync: handleAddProduct },
          updateProduct: { mutateAsync: handleUpdateProduct },
          updateAvailability: updateAvailabilityMutation,
          deleteProduct: deleteProductMutation,
          bulkDeleteProducts: bulkDeleteProductsMutation,
        }}
      />
    </div>
  )
}
