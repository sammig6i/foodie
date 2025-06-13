import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const auth = await ctx.auth.getUserIdentity()
    if (!auth) {
      return null
    }

    return {
      id: auth.subject,
      email: auth.email || '',
      name: auth.name || auth.given_name || auth.email || '',
    }
  },
})

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const auth = await ctx.auth.getUserIdentity()
    if (!auth) {
      return false
    }

    const admin = await ctx.db
      .query('admins')
      .withIndex('by_user', (q) => q.eq('userId', auth.subject))
      .first()

    return !!admin
  },
})

export const getAdminUser = query({
  args: {},
  handler: async (ctx) => {
    const auth = await ctx.auth.getUserIdentity()
    if (!auth) {
      return null
    }

    const admin = await ctx.db
      .query('admins')
      .withIndex('by_user', (q) => q.eq('userId', auth.subject))
      .first()

    if (!admin) {
      return null
    }

    return {
      id: auth.subject,
      email: auth.email || '',
      name: auth.name || auth.given_name || auth.email || '',
      role: admin.role,
    }
  },
})

export const createTestAdmin = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('admins')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (existing) {
      throw new Error('User is already an admin')
    }

    await ctx.db.insert('admins', {
      userId: args.userId,
      role: 'admin',
      createdAt: Date.now(),
    })

    return 'Admin created successfully'
  },
})

export const getAllAdmins = query({
  args: {},
  handler: async (ctx) => {
    const auth = await ctx.auth.getUserIdentity()
    if (!auth) {
      throw new Error('Not authenticated')
    }

    const isCurrentUserAdmin = await ctx.db
      .query('admins')
      .withIndex('by_user', (q) => q.eq('userId', auth.subject))
      .first()

    if (!isCurrentUserAdmin) {
      throw new Error('Not authorized')
    }

    return await ctx.db.query('admins').collect()
  },
})

export const removeAdmin = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await ctx.auth.getUserIdentity()
    if (!auth) {
      throw new Error('Not authenticated')
    }

    const isCurrentUserAdmin = await ctx.db
      .query('admins')
      .withIndex('by_user', (q) => q.eq('userId', auth.subject))
      .first()

    if (!isCurrentUserAdmin) {
      throw new Error('Not authorized')
    }

    if (args.userId === auth.subject) {
      throw new Error('Cannot remove yourself as admin')
    }

    const adminToRemove = await ctx.db
      .query('admins')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (!adminToRemove) {
      throw new Error('Admin not found')
    }

    await ctx.db.delete(adminToRemove._id)
    return 'Admin removed successfully'
  },
})
