import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { TimePicker } from '@/components/features/business-hours'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { validateField, getValidationError } from '@/lib/schedule-validation'
import { toast } from 'sonner'

interface DayScheduleRowProps {
  day: { key: number; label: string; short: string }
  daySchedule: {
    dayOfWeek: number
    isOpen: boolean
    openTime?: string
    closeTime?: string
  }
  onUpdate: (updates: {
    isOpen?: boolean
    openTime?: string
    closeTime?: string
  }) => void
}

export const TIME_PRESETS = [
  { label: 'Early Morning', openTime: '06:00', closeTime: '14:00' },
  { label: 'Standard Hours', openTime: '09:00', closeTime: '17:00' },
  { label: 'Extended Hours', openTime: '07:00', closeTime: '19:00' },
  { label: 'Late Hours', openTime: '10:00', closeTime: '22:00' },
]

export function DayScheduleRow({
  day,
  daySchedule,
  onUpdate,
}: DayScheduleRowProps) {
  const validateTimeRange = (openTime: string, closeTime: string) => {
    if (!daySchedule.isOpen) {
      return true
    }

    const validationResult = validateField.timeRange(openTime, closeTime)

    if (!validationResult.success) {
      const errorMessage = getValidationError(validationResult)
      toast.error(`${day.label}: ${errorMessage}`)
      return false
    }

    return true
  }

  const applyPreset = (preset: { openTime: string; closeTime: string }) => {
    onUpdate({
      isOpen: true,
      openTime: preset.openTime,
      closeTime: preset.closeTime,
    })

    if (!validateTimeRange(preset.openTime, preset.closeTime)) {
      toast.error(`${day.label}: Invalid time range in preset`)
    }
  }

  const handleTimeUpdate = (
    field: 'openTime' | 'closeTime',
    newTime: string,
  ) => {
    const currentOpenTime =
      field === 'openTime' ? newTime : daySchedule.openTime || '09:00'
    const currentCloseTime =
      field === 'closeTime' ? newTime : daySchedule.closeTime || '17:00'

    onUpdate({ [field]: newTime })

    const timeValidation = validateField.time(newTime)
    if (!timeValidation.success) {
      toast.error(`${day.label}: ${getValidationError(timeValidation)}`)
    }

    validateTimeRange(currentOpenTime, currentCloseTime)
  }

  const handleToggleOpen = (isOpen: boolean) => {
    onUpdate({ isOpen })
  }

  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  return (
    <div className="flex flex-col gap-2 py-4 border-b border-border/50 last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 sm:w-20">
            <Switch
              checked={daySchedule.isOpen}
              onCheckedChange={handleToggleOpen}
            />
          </div>
          <div className="w-20 sm:w-24 text-sm font-medium">{day.label}</div>
        </div>

        {daySchedule.isOpen ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-1">
              <TimePicker
                value={daySchedule.openTime || '09:00'}
                onChange={(openTime) => handleTimeUpdate('openTime', openTime)}
                label="Opening Time"
              />
              <span className="text-muted-foreground text-sm">-</span>
              <TimePicker
                value={daySchedule.closeTime || '17:00'}
                onChange={(closeTime) =>
                  handleTimeUpdate('closeTime', closeTime)
                }
                label="Closing Time"
              />
            </div>

            <div className="flex justify-end sm:ml-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Presets
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm mb-3">Quick Presets</h4>
                    {TIME_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="ghost"
                        size="sm"
                        onClick={() => applyPreset(preset)}
                        className="w-full justify-between"
                      >
                        <span>{preset.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDisplayTime(preset.openTime)} -{' '}
                          {formatDisplayTime(preset.closeTime)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        ) : (
          <div className="flex-1 text-sm text-muted-foreground">Closed</div>
        )}
      </div>
    </div>
  )
}
