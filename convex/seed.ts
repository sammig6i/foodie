import { internal } from './_generated/api'
import { Id } from './_generated/dataModel'
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { internalMutation } from './_generated/server'

export const deleteData = mutation({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db.query('schedules').collect()
    for (const schedule of schedules) {
      await ctx.db.delete(schedule._id)
    }

    const products = await ctx.db.query('products').collect()
    for (const product of products) {
      await ctx.db.delete(product._id)
    }

    const dateOverrides = await ctx.db.query('dateOverrides').collect()
    for (const dateOverride of dateOverrides) {
      await ctx.db.delete(dateOverride._id)
    }

    const batchOptions = await ctx.db.query('batchOptions').collect()
    for (const batchOption of batchOptions) {
      await ctx.db.delete(batchOption._id)
    }

    const orders = await ctx.db.query('orders').collect()
    for (const order of orders) {
      await ctx.db.delete(order._id)
    }
  },
})
export const seedSchedules = mutation({
  args: {},
  handler: async (ctx) => {
    if (await ctx.db.query('schedules').first()) {
      console.log('Schedules already seeded')
      return false
    }

    // Create weekly schedules
    const schedules = [
      {
        name: 'Regular Business Hours',
        isActive: true,
        weeklyHours: [
          {
            dayOfWeek: 0,
            isOpen: false,
            openTime: '09:00',
            closeTime: '17:00',
          }, // Sunday
          { dayOfWeek: 1, isOpen: true, openTime: '07:00', closeTime: '15:00' }, // Monday
          { dayOfWeek: 2, isOpen: true, openTime: '07:00', closeTime: '15:00' }, // Tuesday
          { dayOfWeek: 3, isOpen: true, openTime: '07:00', closeTime: '15:00' }, // Wednesday
          { dayOfWeek: 4, isOpen: true, openTime: '07:00', closeTime: '15:00' }, // Thursday
          { dayOfWeek: 5, isOpen: true, openTime: '07:00', closeTime: '15:00' }, // Friday
          { dayOfWeek: 6, isOpen: true, openTime: '08:00', closeTime: '16:00' }, // Saturday
        ],
      },
      {
        name: 'Weekend Extended Hours',
        isActive: false,
        weeklyHours: [
          { dayOfWeek: 0, isOpen: true, openTime: '08:00', closeTime: '14:00' }, // Sunday
          { dayOfWeek: 1, isOpen: true, openTime: '07:00', closeTime: '15:00' }, // Monday
          { dayOfWeek: 2, isOpen: true, openTime: '07:00', closeTime: '15:00' }, // Tuesday
          { dayOfWeek: 3, isOpen: true, openTime: '07:00', closeTime: '15:00' }, // Wednesday
          { dayOfWeek: 4, isOpen: true, openTime: '07:00', closeTime: '15:00' }, // Thursday
          { dayOfWeek: 5, isOpen: true, openTime: '07:00', closeTime: '18:00' }, // Friday
          { dayOfWeek: 6, isOpen: true, openTime: '07:00', closeTime: '18:00' }, // Saturday
        ],
      },
      {
        name: 'Summer Hours',
        isActive: false,
        weeklyHours: [
          {
            dayOfWeek: 0,
            isOpen: false,
            openTime: '09:00',
            closeTime: '17:00',
          }, // Sunday
          { dayOfWeek: 1, isOpen: true, openTime: '06:30', closeTime: '14:30' }, // Monday
          { dayOfWeek: 2, isOpen: true, openTime: '06:30', closeTime: '14:30' }, // Tuesday
          { dayOfWeek: 3, isOpen: true, openTime: '06:30', closeTime: '14:30' }, // Wednesday
          { dayOfWeek: 4, isOpen: true, openTime: '06:30', closeTime: '14:30' }, // Thursday
          { dayOfWeek: 5, isOpen: true, openTime: '06:30', closeTime: '14:30' }, // Friday
          { dayOfWeek: 6, isOpen: true, openTime: '07:30', closeTime: '15:30' }, // Saturday
        ],
      },
    ]

    for (const schedule of schedules) {
      await ctx.db.insert('schedules', schedule)
    }

    // Create some date overrides for holidays
    const dateOverrides = [
      {
        date: '2024-12-25',
        name: 'Christmas Day',
        isOpen: false,
      },
      {
        date: '2024-01-01',
        name: "New Year's Day",
        isOpen: false,
      },
      {
        date: '2024-07-04',
        name: 'Independence Day',
        isOpen: true,
        openTime: '08:00',
        closeTime: '13:00',
      },
      {
        date: '2024-11-29',
        name: 'Black Friday',
        isOpen: true,
        openTime: '06:00',
        closeTime: '18:00',
      },
    ]

    for (const override of dateOverrides) {
      await ctx.db.insert('dateOverrides', override)
    }

    console.log('Successfully seeded 3 weekly schedules and 4 date overrides')
    return true
  },
})

// Initialize default products
export const seedDrinksandSides = mutation({
  args: {},
  handler: async (ctx) => {
    if (await ctx.db.query('products').first()) {
      console.log('Drinks and sides already seeded')
      return false
    }

    // Add drinks
    const drinks = [
      { name: 'Coffee', price: 2.0, description: 'Fresh brewed coffee' },
      { name: 'Espresso', price: 2.5, description: 'Rich espresso shot' },
      {
        name: 'Cappuccino',
        price: 3.5,
        description: 'Espresso with steamed milk foam',
      },
      {
        name: 'Orange Juice',
        price: 3.0,
        description: 'Fresh squeezed orange juice',
      },
      { name: 'Water', price: 1.5, description: 'Bottled water' },
    ]

    for (const drink of drinks) {
      await ctx.db.insert('products', {
        ...drink,
        category: 'drinks',
        available: true,
      })
    }

    // Add sides
    const sides = [
      { name: 'Cream Cheese', price: 1.5, description: 'Plain cream cheese' },
      { name: 'Butter', price: 1.0, description: 'Fresh butter' },
      { name: 'Jam', price: 1.25, description: 'Strawberry jam' },
      { name: 'Lox', price: 4.0, description: 'Smoked salmon' },
    ]

    for (const side of sides) {
      await ctx.db.insert('products', {
        ...side,
        category: 'sides',
        available: true,
      })
    }

    // Add batch options
    const batchOptions = [
      { size: 4, discount: 5, name: '4-Pack' },
      { size: 6, discount: 10, name: 'Half Dozen' },
      { size: 12, discount: 15, name: 'Dozen' },
    ]

    for (const batch of batchOptions) {
      await ctx.db.insert('batchOptions', batch)
    }

    return true
  },
})

export const addProductWithImage = internalMutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal('bagels'),
      v.literal('drinks'),
      v.literal('sides'),
    ),
    price: v.number(),
    description: v.optional(v.string()),
    imageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('products', {
      ...args,
      available: true,
    })
  },
})

export const seedBagelsWithImages = mutation({
  args: {},
  handler: async (ctx) => {
    if (await ctx.db.query('products').first()) {
      console.log('Bagels already seeded')
      return false
    }

    const bagels = [
      {
        name: 'Plain Bagel',
        price: 2.5,
        description: 'Classic plain bagel',
        imageId: 'kg2e77bstrybj5xfqesmkagxb57h8s71' as Id<'_storage'>,
      },
      {
        name: 'Everything Bagel',
        price: 2.75,
        description: 'Topped with sesame seeds, poppy seeds, garlic, and onion',
        imageId: 'kg2302y655yejht705vd0eq71s7h95my' as Id<'_storage'>,
      },
      {
        name: 'Sesame Bagel',
        price: 2.75,
        description: 'Topped with sesame seeds',
        imageId: 'kg2dspa6p5bbzqm6n7r6abhjn97h8c5q' as Id<'_storage'>,
      },
      {
        name: 'Poppy Seed Bagel',
        price: 2.75,
        description: 'Topped with poppy seeds',
        imageId: 'kg2f83paghrw6283rdde6d7nxn7h9ab1' as Id<'_storage'>,
      },
      {
        name: 'Cinnamon Raisin Bagel',
        price: 3.0,
        description: 'Sweet bagel with cinnamon and raisins',
        imageId: 'kg22386wb9936zp9sk5hqytsc17h8b7r' as Id<'_storage'>,
      },
      {
        name: 'Blueberry Bagel',
        price: 3.0,
        description: 'Fresh blueberries baked in',
        imageId: 'kg2122k1hyvmeveza9ed97tyzn7h9n3n' as Id<'_storage'>,
      },
    ]

    for (const bagel of bagels) {
      await ctx.runMutation(internal.seed.addProductWithImage, {
        name: bagel.name,
        category: 'bagels',
        price: bagel.price,
        description: bagel.description,
        imageId: bagel.imageId,
      })
    }

    return true
  },
})
