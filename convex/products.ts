import { query, mutation, internalMutation } from './_generated/server'
import { v } from 'convex/values'

export const getProductsByCategory = query({
  args: {},
  returns: v.object({
    bagels: v.array(v.any()),
    drinks: v.array(v.any()),
    sides: v.array(v.any()),
  }),
  handler: async (ctx) => {
    const products = await ctx.db
      .query('products')
      .filter((q) => q.eq(q.field('available'), true))
      .collect()

    const productsWithUrls = await Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: p.imageId ? await ctx.storage.getUrl(p.imageId) : null,
      })),
    )

    const bagels = productsWithUrls.filter((p) => p.category === 'bagels')
    const drinks = productsWithUrls.filter((p) => p.category === 'drinks')
    const sides = productsWithUrls.filter((p) => p.category === 'sides')

    return { bagels, drinks, sides }
  },
})

// Admin: Get all products (including unavailable ones)
// TODO add pagination options for the query
export const getAllProducts = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const products = await ctx.db.query('products').collect()

    const productsWithUrls = await Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: p.imageId ? await ctx.storage.getUrl(p.imageId) : null,
      })),
    )

    return productsWithUrls.sort((a, b) => a.name.localeCompare(b.name))
  },
})

// Get available categories for dropdowns
export const getAvailableCategories = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const categories = await ctx.db
      .query('products')
      .collect()
      .then((products) => [...new Set(products.map((p) => p.category))])
    return categories
  },
})

// Get available status options for dropdowns
export const getAvailableStatuses = query({
  args: {},
  returns: v.array(
    v.object({
      value: v.boolean(),
      label: v.string(),
    }),
  ),
  handler: async (ctx) => {
    return [
      { value: true, label: 'Available' },
      { value: false, label: 'Unavailable' },
    ]
  },
})

export const getBatchOptions = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query('batchOptions').collect()
  },
})

// Generate upload URL for images
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

// Admin: Add product with optional image
export const addProduct = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal('bagels'),
      v.literal('drinks'),
      v.literal('sides'),
    ),
    price: v.number(),
    description: v.optional(v.string()),
    available: v.optional(v.boolean()),
    imageId: v.optional(v.id('_storage')),
  },
  returns: v.id('products'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('products', {
      ...args,
      available: args.available ?? true,
    })
  },
})

// Admin: Update product with image handling
export const updateProduct = mutation({
  args: {
    productId: v.id('products'),
    name: v.optional(v.string()),
    category: v.optional(
      v.union(v.literal('bagels'), v.literal('drinks'), v.literal('sides')),
    ),
    price: v.optional(v.number()),
    description: v.optional(v.union(v.string(), v.null())),
    available: v.optional(v.boolean()),
    imageId: v.optional(v.union(v.id('_storage'), v.null())),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const { productId, ...updates } = args

    const existingProduct = await ctx.db.get(productId)
    if (!existingProduct) {
      throw new Error('Product not found')
    }

    const updateFields: Record<string, any> = {}

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (key === 'description') {
          updateFields[key] = value === null || value === '' ? undefined : value
        } else if (key === 'imageId') {
          if (value === null && existingProduct.imageId) {
            await ctx.storage.delete(existingProduct.imageId)
            updateFields[key] = undefined
          } else if (value !== null) {
            if (existingProduct.imageId && existingProduct.imageId !== value) {
              await ctx.storage.delete(existingProduct.imageId)
            }
            updateFields[key] = value
          }
        } else {
          updateFields[key] = value
        }
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No updates provided')
    }

    await ctx.db.patch(productId, updateFields)
    return await ctx.db.get(productId)
  },
})

// Admin: Update product availability
export const updateAvailability = mutation({
  args: {
    productId: v.id('products'),
    available: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, {
      available: args.available,
    })
    return null
  },
})

// Admin: Delete product with image cleanup
export const deleteProduct = mutation({
  args: {
    productId: v.id('products'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId)
    if (!product) {
      throw new Error('Product not found')
    }

    if (product.imageId) {
      await ctx.storage.delete(product.imageId)
    }

    await ctx.db.delete(args.productId)
    return null
  },
})

// Admin: Bulk delete products with image cleanup
export const bulkDeleteProducts = mutation({
  args: {
    productIds: v.array(v.id('products')),
  },
  returns: v.object({
    deletedCount: v.number(),
    failedCount: v.number(),
  }),
  handler: async (ctx, args) => {
    let deletedCount = 0
    let failedCount = 0

    for (const productId of args.productIds) {
      try {
        const product = await ctx.db.get(productId)
        if (!product) {
          failedCount++
          continue
        }

        if (product.imageId) {
          await ctx.storage.delete(product.imageId)
        }

        await ctx.db.delete(productId)
        deletedCount++
      } catch (error) {
        failedCount++
      }
    }

    return { deletedCount, failedCount }
  },
})

// save image to db
export const saveImage = mutation({
  args: {
    storageId: v.id('_storage'),
    name: v.string(),
    category: v.union(
      v.literal('bagels'),
      v.literal('drinks'),
      v.literal('sides'),
    ),
    price: v.number(),
    available: v.boolean(),
  },
  returns: v.id('products'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('products', {
      imageId: args.storageId,
      name: args.name,
      category: args.category,
      price: args.price,
      available: args.available,
    })
  },
})
