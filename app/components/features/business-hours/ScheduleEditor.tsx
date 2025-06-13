import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  DayScheduleRow,
  TIME_PRESETS,
} from '@/components/features/business-hours'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ArrowLeft, Copy, Loader2, Check, AlertCircle } from 'lucide-react'
import { Doc } from '@/../convex/_generated/dataModel'
import { useState } from 'react'
import { validateField, getValidationError } from '@/lib/schedule-validation'
import { toast } from 'sonner'

type Schedule = Doc<'schedules'>

interface ScheduleEditorProps {
  schedule: Schedule
  onBack: () => void
  onUpdate: (schedule: Schedule) => void
  onActivateSchedule: (scheduleId: string, isActive: boolean) => void
  updateMutationStatus?: {
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
  }
  toggleMutationStatus?: {
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
  }
}

const DAYS = [
  { key: 0, label: 'Sunday', short: 'Sun' },
  { key: 1, label: 'Monday', short: 'Mon' },
  { key: 2, label: 'Tuesday', short: 'Tue' },
  { key: 3, label: 'Wednesday', short: 'Wed' },
  { key: 4, label: 'Thursday', short: 'Thu' },
  { key: 5, label: 'Friday', short: 'Fri' },
  { key: 6, label: 'Saturday', short: 'Sat' },
]

export function ScheduleEditor({
  schedule,
  onBack,
  onUpdate,
  onActivateSchedule,
  updateMutationStatus,
  toggleMutationStatus,
}: ScheduleEditorProps) {
  const [tempName, setTempName] = React.useState(schedule.name)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>(
    'saved',
  )
  const prevScheduleRef = React.useRef(schedule)

  React.useEffect(() => {
    setTempName(schedule.name)
  }, [schedule.name])

  React.useEffect(() => {
    const hasDataChanged =
      JSON.stringify(schedule) !== JSON.stringify(prevScheduleRef.current)

    if (updateMutationStatus?.isLoading || toggleMutationStatus?.isLoading) {
      setSaveStatus('saving')
    } else if (updateMutationStatus?.isError || toggleMutationStatus?.isError) {
      if (hasDataChanged) {
        setSaveStatus('saved')
      } else {
        setSaveStatus('error')
      }
    } else if (
      updateMutationStatus?.isSuccess ||
      toggleMutationStatus?.isSuccess
    ) {
      setSaveStatus('saved')
    } else if (hasDataChanged) {
      setSaveStatus('saved')
    }

    prevScheduleRef.current = schedule
  }, [updateMutationStatus, toggleMutationStatus, schedule])

  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const updateDaySchedule = (
    dayOfWeek: number,
    updates: { isOpen?: boolean; openTime?: string; closeTime?: string },
  ) => {
    const updatedWeeklyHours = schedule.weeklyHours.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day,
    )
    onUpdate({ ...schedule, weeklyHours: updatedWeeklyHours })
  }

  const saveName = (name: string) => {
    const validationResult = validateField.scheduleName(name.trim())

    if (!validationResult.success) {
      toast.error(getValidationError(validationResult))
      setTempName(schedule.name)
      return
    }

    if (name.trim() !== '' && name.trim() !== schedule.name) {
      onUpdate({ ...schedule, name: name.trim() })
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setTempName(newValue)
  }

  const handleNameBlur = () => {
    if (tempName.trim() === '') {
      setTempName(schedule.name)
      return
    }

    if (tempName.trim() !== schedule.name) {
      saveName(tempName)
    }
  }

  const applyPresetToAll = (preset: {
    openTime: string
    closeTime: string
  }) => {
    const updatedWeeklyHours = schedule.weeklyHours.map((day) => ({
      ...day,
      isOpen: day.isOpen ? true : day.isOpen,
      openTime: day.isOpen ? preset.openTime : day.openTime,
      closeTime: day.isOpen ? preset.closeTime : day.closeTime,
    }))
    onUpdate({ ...schedule, weeklyHours: updatedWeeklyHours })

    const openDaysCount = schedule.weeklyHours.filter(
      (day) => day.isOpen,
    ).length
    const presetInfo = TIME_PRESETS.find(
      (p) => p.openTime === preset.openTime && p.closeTime === preset.closeTime,
    )
    const presetLabel = presetInfo?.label || 'Custom'

    if (openDaysCount > 0) {
      toast.success(
        `Applied ${presetLabel} preset to ${openDaysCount} open day${openDaysCount === 1 ? '' : 's'}`,
      )
    } else {
      toast.info('No open days to apply preset to')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <Input
              value={tempName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              className="text-lg sm:text-xl font-bold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
              placeholder="Schedule name"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-3 w-3" />
                <span>Saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>Save failed</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active</span>
            <Switch
              id={`schedule-${schedule._id}`}
              checked={schedule.isActive}
              onCheckedChange={(checked) =>
                onActivateSchedule(schedule._id, checked)
              }
              className={
                schedule.isActive
                  ? 'data-[state=checked]:bg-[rgba(101,197,103,1)]'
                  : ''
              }
            />
          </div>

          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Copy</span>
          </Button>
        </div>
      </div>

      {/* Weekly Hours */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold">Weekly Hours</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">
                    Apply Preset to All Open Days
                  </span>
                  <span className="sm:hidden">Global Presets</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm mb-3">
                    Apply to All Open Days
                  </h4>
                  {TIME_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      onClick={() => applyPresetToAll(preset)}
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

          <div className="space-y-0">
            {DAYS.map((day) => {
              const daySchedule = schedule.weeklyHours.find(
                (d) => d.dayOfWeek === day.key,
              ) || {
                dayOfWeek: day.key,
                isOpen: false,
                openTime: '09:00',
                closeTime: '17:00',
              }

              return (
                <DayScheduleRow
                  key={day.key}
                  day={day}
                  daySchedule={daySchedule}
                  onUpdate={(updates) => updateDaySchedule(day.key, updates)}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
