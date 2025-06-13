import { z } from 'zod'

export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name is too long'),
  category: z.enum(['bagels', 'drinks', 'sides'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a valid number',
    })
    .min(0.01, 'Price must be greater than 0')
    .max(999.99, 'Price is too high (max $999.99)'),
  description: z
    .string()
    .max(500, 'Description is too long (max 500 characters)')
    .optional()
    .nullable(),
  available: z.boolean().default(true),
  imageId: z.string().optional().nullable(),
  imageFile: z
    .instanceof(File)
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      'File size must be less than 5MB',
    )
    .optional()
    .nullable(),
  imageUrl: z.string().optional().nullable(),
})

export type ProductFormData = z.infer<typeof productFormSchema>

export const editProductFormSchema = productFormSchema.extend({
  productId: z.string().min(1, 'Product ID is required'),
})

export type EditProductFormData = z.infer<typeof editProductFormSchema>

export function hasProductDataChanged(
  original: ProductFormData,
  updated: ProductFormData,
): boolean {
  const normalizeDescription = (desc: string | null | undefined) =>
    desc?.trim() === '' ? null : desc?.trim() || null

  return (
    original.name !== updated.name ||
    original.category !== updated.category ||
    original.price !== updated.price ||
    normalizeDescription(original.description) !==
      normalizeDescription(updated.description) ||
    original.available !== updated.available ||
    original.imageId !== updated.imageId ||
    Boolean(updated.imageFile)
  )
}

export function getChangedFields(
  original: ProductFormData,
  updated: ProductFormData,
): Partial<ProductFormData> {
  const changes: Partial<ProductFormData> = {}

  if (original.name !== updated.name) {
    changes.name = updated.name
  }

  if (original.category !== updated.category) {
    changes.category = updated.category
  }

  if (original.price !== updated.price) {
    changes.price = updated.price
  }

  const normalizeDescription = (desc: string | null | undefined) =>
    desc?.trim() === '' ? null : desc?.trim() || null

  const originalDesc = normalizeDescription(original.description)
  const updatedDesc = normalizeDescription(updated.description)

  if (originalDesc !== updatedDesc) {
    changes.description = updatedDesc
  }

  if (original.available !== updated.available) {
    changes.available = updated.available
  }

  if (original.imageId !== updated.imageId) {
    changes.imageId = updated.imageId
  }

  if (updated.imageFile) {
    changes.imageFile = updated.imageFile
  }

  return changes
}

export const validateField = {
  name: (value: string) => productFormSchema.shape.name.safeParse(value),
  category: (value: string) =>
    productFormSchema.shape.category.safeParse(value),
  price: (value: number) => productFormSchema.shape.price.safeParse(value),
  description: (value: string | null) => {
    const normalized = value?.trim() === '' ? null : value?.trim() || null
    return productFormSchema.shape.description.safeParse(normalized)
  },
  available: (value: boolean) =>
    productFormSchema.shape.available.safeParse(value),
  imageFile: (value: File | null) =>
    productFormSchema.shape.imageFile.safeParse(value),
}

export function getValidationError(
  result: z.SafeParseReturnType<any, any>,
): string | null {
  return result.success
    ? null
    : result.error.errors[0]?.message || 'Invalid value'
}
