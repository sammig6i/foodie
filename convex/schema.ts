import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Products table for bagels, drinks, and sides
  products: defineTable({
    name: v.string(),
    category: v.union(
      v.literal('bagels'),
      v.literal('drinks'),
      v.literal('sides'),
    ),
    price: v.number(),
    description: v.optional(v.string()),
    available: v.boolean(),
    imageId: v.optional(v.id('_storage')),
  }).index('by_category', ['category']),

  // Batch options for bagels
  batchOptions: defineTable({
    size: v.number(), // 4, 6, 12
    discount: v.number(), // percentage discount
    name: v.string(), // "Half Dozen", "Dozen", etc.
  }),

  // Orders table
  orders: defineTable({
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    items: v.array(
      v.object({
        productId: v.id('products'),
        productName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        batchSize: v.optional(v.number()), // for bagel batches
      }),
    ),
    totalAmount: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('confirmed'),
      v.literal('preparing'),
      v.literal('ready'),
      v.literal('fulfilled'),
      v.literal('cancelled'),
    ),
    paymentStatus: v.union(
      v.literal('pending'),
      v.literal('paid'),
      v.literal('failed'),
      v.literal('refunded'),
    ),
    stripePaymentIntentId: v.optional(v.string()),
    notes: v.optional(v.string()),
    estimatedReadyTime: v.optional(v.number()),
  }).index('by_status', ['status']),

  // Shop settings
  shopSettings: defineTable({
    key: v.string(),
    value: v.union(v.string(), v.number(), v.boolean()),
  }).index('by_key', ['key']),

  // Availability schedules - Simplified approach
  schedules: defineTable({
    name: v.string(), // "Regular Hours", "Summer Schedule", etc.
    isActive: v.boolean(), // Only one can be active at a time

    // Weekly recurring hours
    weeklyHours: v.array(
      v.object({
        dayOfWeek: v.number(), // 0 = Sunday, 1 = Monday, etc.
        isOpen: v.boolean(),
        openTime: v.optional(v.string()), // "09:00"
        closeTime: v.optional(v.string()), // "17:00"
      }),
    ),
  }).index('by_active', ['isActive']),

  // Date-specific overrides (holidays, special events, etc.)
  dateOverrides: defineTable({
    date: v.string(), // "2024-12-25"
    name: v.string(), // "Christmas Day", "Black Friday", etc.
    isOpen: v.boolean(),
    openTime: v.optional(v.string()), // "09:00"
    closeTime: v.optional(v.string()), // "17:00"
  }).index('by_date', ['date']),

  // Admin users (for dashboard access)
  // Stores Clerk user IDs that have admin privileges
  admins: defineTable({
    userId: v.string(), // Clerk user ID (e.g., "user_2abc123def456")
    role: v.literal('admin'),
    createdAt: v.optional(v.number()), // timestamp when admin was created
  }).index('by_user', ['userId']),
})
