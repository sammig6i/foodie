import { useForm, useStore } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/features/products/image-upload'
import {
  productFormSchema,
  type ProductFormData,
} from '@/lib/product-form-schema'
import { useState, useEffect } from 'react'

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void
  initialValues?: Partial<ProductFormData>
  categories?: string[]
  isSubmitting?: boolean
  submitLabel?: string
}

export function ProductForm({
  onSubmit,
  initialValues,
  categories = ['bagels', 'drinks', 'sides'],
  isSubmitting = false,
  submitLabel = 'Save Product',
}: ProductFormProps) {
  const [priceDisplayValue, setPriceDisplayValue] = useState('')
  const [isPriceEditing, setIsPriceEditing] = useState(false)

  const form = useForm({
    defaultValues: {
      name: '',
      category: 'bagels' as const,
      price: 0,
      description: null,
      available: false,
      imageId: null,
      imageFile: null,
      imageUrl: null,
      ...initialValues,
    },
    onSubmit: async ({ value }) => {
      try {
        const processedValue = {
          ...value,
          description:
            value.description?.trim() === '' ? null : value.description?.trim(),
        }
        const validatedData = productFormSchema.parse(processedValue)
        onSubmit(validatedData)
      } catch (error) {
        console.error('Validation error:', error)
      }
    },
  })

  useEffect(() => {
    const initialPrice = initialValues?.price ?? 0
    setPriceDisplayValue(initialPrice === 0 ? '' : initialPrice.toFixed(2))
  }, [initialValues?.price])

  const currentPrice = useStore(form.store, (state) => state.values.price)

  useEffect(() => {
    if (!isPriceEditing) {
      setPriceDisplayValue(currentPrice === 0 ? '' : currentPrice.toFixed(2))
    }
  }, [currentPrice, isPriceEditing])

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="imageFile"
        validators={{
          onChange: ({ value }) => {
            if (!value) return undefined
            const result = productFormSchema.shape.imageFile.safeParse(value)
            return result.success ? undefined : result.error.errors[0]?.message
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label>Product Image</Label>
            <ImageUpload
              onFileSelect={(file) => {
                field.handleChange(file)
              }}
              onFileRemove={() => {
                field.handleChange(null)
                form.setFieldValue('imageId', null)
                form.setFieldValue('imageUrl', null)
              }}
              initialImageUrl={initialValues?.imageUrl}
              disabled={isSubmitting}
              error={field.state.meta.errors[0]}
            />
          </div>
        )}
      </form.Field>

      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            const result = productFormSchema.shape.name.safeParse(value)
            return result.success ? undefined : result.error.errors[0]?.message
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Product Name</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter product name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="category"
          validators={{
            onChange: ({ value }) => {
              const result = productFormSchema.shape.category.safeParse(value)
              return result.success
                ? undefined
                : result.error.errors[0]?.message
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Category</Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as any)}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <span className="capitalize">{category}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="price"
          validators={{
            onChange: ({ value }) => {
              const result = productFormSchema.shape.price.safeParse(value)
              return result.success
                ? undefined
                : result.error.errors[0]?.message
            },
          }}
        >
          {(field) => {
            return (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Price</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceDisplayValue}
                  onFocus={(e) => {
                    setIsPriceEditing(true)
                    e.target.select()
                  }}
                  onBlur={(e) => {
                    setIsPriceEditing(false)
                    field.handleBlur()
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value) && value >= 0) {
                      field.handleChange(value)
                      setPriceDisplayValue(value.toFixed(2))
                    } else if (e.target.value === '' || isNaN(value)) {
                      field.handleChange(0)
                      setPriceDisplayValue('')
                    }
                  }}
                  onChange={(e) => {
                    setPriceDisplayValue(e.target.value)
                    const value =
                      e.target.value === '' ? 0 : parseFloat(e.target.value)
                    field.handleChange(isNaN(value) ? 0 : value)
                  }}
                  placeholder="0.00"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )
          }}
        </form.Field>
      </div>

      <form.Field
        name="description"
        validators={{
          onChange: ({ value }) => {
            if (value && value.length > 500) {
              return 'Description is too long (max 500 characters)'
            }
            return undefined
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Description</Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value || ''}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter product description (optional)"
              className="min-h-[80px] max-h-32 resize-y"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.ctrlKey) {
                  e.preventDefault()
                } else if (e.key === 'Enter' && e.ctrlKey) {
                  form.handleSubmit()
                }
              }}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="available"
        validators={{
          onChange: ({ value }) => {
            const result = productFormSchema.shape.available.safeParse(value)
            return result.success ? undefined : result.error.errors[0]?.message
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Availability</Label>
            <Select
              value={field.state.value?.toString() ?? 'true'}
              onValueChange={(value) => field.handleChange(value === 'true')}
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Available</SelectItem>
                <SelectItem value="false">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, formIsSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || formIsSubmitting}
            className="w-full"
          >
            {isSubmitting || formIsSubmitting ? 'Saving...' : submitLabel}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
