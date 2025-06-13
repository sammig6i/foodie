import { z } from 'zod'

export const timeSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
  .refine((time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
  }, 'Time must be between 00:00 and 23:59')

export const dayScheduleSchema = z
  .object({
    dayOfWeek: z.number().min(0).max(6),
    isOpen: z.boolean(),
    openTime: timeSchema.optional(),
    closeTime: timeSchema.optional(),
  })
  .refine((data) => {
    if (data.isOpen && data.openTime && data.closeTime) {
      return data.openTime < data.closeTime
    }
    return true
  }, 'Opening time must be before closing time')

export const scheduleSchema = z.object({
  name: z
    .string()
    .min(1, 'Schedule name is required')
    .max(100, 'Schedule name is too long'),
  isActive: z.boolean(),
  weeklyHours: z.array(dayScheduleSchema),
})

export const validateField = {
  time: (value: string) => timeSchema.safeParse(value),
  scheduleName: (value: string) => scheduleSchema.shape.name.safeParse(value),
  daySchedule: (value: any) => dayScheduleSchema.safeParse(value),
  timeRange: (openTime: string, closeTime: string) => {
    const openResult = timeSchema.safeParse(openTime)
    const closeResult = timeSchema.safeParse(closeTime)

    if (!openResult.success) return openResult
    if (!closeResult.success) return closeResult

    if (openTime >= closeTime) {
      return {
        success: false,
        error: {
          errors: [{ message: 'Opening time must be before closing time' }],
        },
      } as z.SafeParseReturnType<any, any>
    }

    return {
      success: true,
      data: { openTime, closeTime },
    } as z.SafeParseReturnType<any, any>
  },
}

export function getValidationError(
  result: z.SafeParseReturnType<any, any>,
): string | null {
  return result.success
    ? null
    : result.error.errors[0]?.message || 'Invalid value'
}

// TODO track dirty fields
