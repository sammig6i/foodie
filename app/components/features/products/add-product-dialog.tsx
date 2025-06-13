import { useState } from 'react'
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
import { PlusIcon } from 'lucide-react'
import { ProductForm } from './product-form'
import { type ProductFormData } from '@/lib/product-form-schema'

interface AddProductDialogProps {
  onAddProduct: (data: ProductFormData) => void
  categories?: string[]
  isSubmitting?: boolean
  trigger?: React.ReactNode
}

export function AddProductDialog({
  onAddProduct,
  categories,
  isSubmitting = false,
  trigger,
}: AddProductDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = (data: ProductFormData) => {
    onAddProduct(data)
    if (!isSubmitting) {
      setOpen(false)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <PlusIcon className="size-4" />
      <span className="hidden lg:inline">Add Product</span>
      <span className="lg:hidden">Add</span>
    </Button>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Add New Product</SheetTitle>
          <SheetDescription>
            Create a new product for your menu. Fill in the details below.
          </SheetDescription>
        </SheetHeader>
        <ProductForm
          onSubmit={handleSubmit}
          categories={categories}
          isSubmitting={isSubmitting}
          submitLabel="Add Product"
        />
        <SheetFooter className="mt-0">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
