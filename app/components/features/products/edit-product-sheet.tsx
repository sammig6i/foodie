import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ProductForm } from './product-form'
import {
  type ProductFormData,
  hasProductDataChanged,
  getChangedFields,
} from '@/lib/product-form-schema'
import type { Doc } from '@/../convex/_generated/dataModel'
import { toast } from 'sonner'

type ProductWithImageUrl = Doc<'products'> & { imageUrl: string | null }

interface EditProductSheetProps {
  product: ProductWithImageUrl
  categories?: string[]
  onUpdateProduct: (data: ProductFormData & { productId: string }) => void
  isSubmitting?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function EditProductSheet({
  product,
  categories,
  onUpdateProduct,
  isSubmitting = false,
  isOpen,
  onOpenChange,
  trigger,
}: EditProductSheetProps) {
  const originalData: ProductFormData = {
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description || null,
    available: product.available ?? true,
    imageId: product.imageId || null,
    imageUrl: product.imageUrl || null,
    imageFile: null,
  }

  const handleSubmit = (data: ProductFormData) => {
    if (!hasProductDataChanged(originalData, data)) {
      toast.info('No changes detected')
      return
    }

    const changedFields = getChangedFields(originalData, data)
    onUpdateProduct({
      ...changedFields,
      productId: product._id,
    } as ProductFormData & { productId: string })
  }

  const defaultTrigger = (
    <Button
      variant="link"
      className="w-full px-1 py-1 text-left text-foreground text-sm font-medium h-auto leading-tight whitespace-normal break-words justify-start hover:underline"
      title={product.name}
    >
      {product.name}
    </Button>
  )

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>Edit Product</SheetTitle>
          <SheetDescription>
            Make changes to your product information
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          <ProductForm
            onSubmit={handleSubmit}
            initialValues={{
              name: product.name,
              category: product.category,
              price: product.price,
              description: product.description || null,
              available: product.available ?? true,
              imageId: product.imageId || null,
              imageUrl: product.imageUrl || null,
              imageFile: null,
            }}
            categories={categories}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
          />

          <SheetFooter className="mt-0">
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
