import { v } from 'convex/values'
import { query, mutation } from './_generated/server'

export const getSchedules = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query('schedules').order('desc').collect()
  },
})

export const getCurrentBusinessHours = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const activeSchedule = await ctx.db
      .query('schedules')
      .filter((q) => q.eq(q.field('isActive'), true))
      .first()

    if (!activeSchedule) {
      return null
    }

    // Check for any date overrides for today
    const today = new Date().toISOString().split('T')[0] // "2024-01-15"
    const todayOverride = await ctx.db
      .query('dateOverrides')
      .filter((q) => q.eq(q.field('date'), today))
      .first()

    // Get date overrides for the next 7 days
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() + i)
      return date.toISOString().split('T')[0]
    })

    const weekOverrides = await ctx.db
      .query('dateOverrides')
      .filter((q) => {
        return next7Days.some((date) => q.eq(q.field('date'), date))
      })
      .collect()

    // Sort by date
    weekOverrides.sort((a, b) => a.date.localeCompare(b.date))

    return {
      schedule: activeSchedule,
      todayOverride: todayOverride || null,
      weekOverrides: weekOverrides,
    }
  },
})

export const isCurrentlyOpen = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const activeSchedule = await ctx.db
      .query('schedules')
      .filter((q) => q.eq(q.field('isActive'), true))
      .first()

    if (!activeSchedule) {
      return false
    }

    const today = new Date().toISOString().split('T')[0] // "2024-01-15"
    const todayOverride = await ctx.db
      .query('dateOverrides')
      .filter((q) => q.eq(q.field('date'), today))
      .first()

    const now = new Date()
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5) // "14:30"

    if (todayOverride) {
      if (!todayOverride.isOpen) {
        return false
      }

      const openTime = todayOverride.openTime
      const closeTime = todayOverride.closeTime

      if (openTime && closeTime) {
        return currentTime >= openTime && currentTime < closeTime
      }

      return todayOverride.isOpen
    }

    const todaySchedule = activeSchedule.weeklyHours.find(
      (day: any) => day.dayOfWeek === currentDay,
    )

    if (!todaySchedule || !todaySchedule.isOpen) {
      return false
    }

    const openTime = todaySchedule.openTime
    const closeTime = todaySchedule.closeTime

    if (openTime && closeTime) {
      return currentTime >= openTime && currentTime < closeTime
    }

    return todaySchedule.isOpen
  },
})

export const getDateOverrides = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('dateOverrides').collect()
  },
})

export const toggleScheduleActive = mutation({
  args: {
    scheduleId: v.id('schedules'),
    isActive: v.boolean(),
  },
  handler: async (ctx, { scheduleId, isActive }) => {
    if (isActive) {
      const allSchedules = await ctx.db.query('schedules').collect()
      for (const schedule of allSchedules) {
        if (schedule._id !== scheduleId && schedule.isActive) {
          await ctx.db.patch(schedule._id, { isActive: false })
        }
      }
    }

    await ctx.db.patch(scheduleId, { isActive })
  },
})

// Admin: delete a schedule
export const deleteSchedule = mutation({
  args: {
    scheduleId: v.id('schedules'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId)
    if (!schedule) {
      throw new Error('Schedule not found')
    }

    await ctx.db.delete(args.scheduleId)
    return null
  },
})

export const addSchedule = mutation({
  args: {
    name: v.string(),
    isActive: v.boolean(),
    weeklyHours: v.array(
      v.object({
        dayOfWeek: v.number(),
        isOpen: v.boolean(),
        openTime: v.optional(v.string()),
        closeTime: v.optional(v.string()),
      }),
    ),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const { name, weeklyHours, isActive } = args

    if (!name || name.trim() === '') {
      throw new Error('Name is required')
    }

    if (!weeklyHours || weeklyHours.length === 0) {
      throw new Error('Weekly hours are required')
    }

    if (weeklyHours.length !== 7) {
      throw new Error('Weekly hours must contain exactly 7 days')
    }

    for (const day of weeklyHours) {
      if (day.isOpen && day.openTime && day.closeTime) {
        if (day.openTime >= day.closeTime) {
          throw new Error(
            `For day ${day.dayOfWeek}, opening time must be before closing time`,
          )
        }
      }
    }

    if (isActive) {
      const allSchedules = await ctx.db.query('schedules').collect()
      for (const schedule of allSchedules) {
        if (schedule.isActive) {
          await ctx.db.patch(schedule._id, { isActive: false })
        }
      }
    }

    const scheduleId = await ctx.db.insert('schedules', {
      name: name.trim(),
      isActive,
      weeklyHours: weeklyHours.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        isOpen: day.isOpen,
        openTime: day.openTime || '09:00',
        closeTime: day.closeTime || '17:00',
      })),
    })

    return await ctx.db.get(scheduleId)
  },
})

export const updateSchedule = mutation({
  args: {
    scheduleId: v.id('schedules'),
    name: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    weeklyHours: v.optional(
      v.array(
        v.object({
          dayOfWeek: v.number(),
          isOpen: v.boolean(),
          openTime: v.optional(v.string()),
          closeTime: v.optional(v.string()),
        }),
      ),
    ),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const { scheduleId, ...updates } = args

    const schedule = await ctx.db.get(scheduleId)
    if (!schedule) {
      throw new Error('Schedule not found')
    }

    if (updates.weeklyHours) {
      for (const day of updates.weeklyHours) {
        if (day.isOpen && day.openTime && day.closeTime) {
          if (day.openTime >= day.closeTime) {
            throw new Error(
              `For day ${day.dayOfWeek}, openTime must be before closeTime`,
            )
          }
        }
      }
    }

    if (updates.isActive) {
      const allSchedules = await ctx.db.query('schedules').collect()
      for (const schedule of allSchedules) {
        if (schedule._id !== scheduleId && schedule.isActive) {
          await ctx.db.patch(schedule._id, { isActive: false })
        }
      }
    }

    await ctx.db.patch(scheduleId, updates)
    return await ctx.db.get(scheduleId)
  },
})
