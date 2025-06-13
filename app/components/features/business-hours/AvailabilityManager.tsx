import * as React from 'react'
import ScheduleSkeleton from '@/components/features/business-hours/ScheduleSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Plus,
  Clock,
  Edit,
  MoreHorizontal,
  CalendarX,
  Calendar,
  ArrowLeft,
  Copy,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Doc } from '@/../convex/_generated/dataModel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu'
import { ScheduleEditor } from './ScheduleEditor'
import { toast } from 'sonner'

type Schedule = Doc<'schedules'>
type DateOverride = Doc<'dateOverrides'>

interface AvailabilityManagerProps {
  data?: Schedule[]
  dateOverrides?: DateOverride[]
  onCreateSchedule: (schedule: any) => Promise<any>
  onActivateSchedule: (scheduleId: string, isActive: boolean) => void
  onDeleteSchedule: (scheduleId: string) => void
  onUpdateSchedule: (schedule: Schedule) => void
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
  onCreateDateOverride: () => void
  onEditDateOverride: (overrideId: string) => void
  onDeleteDateOverride: (overrideId: string) => void
  isPending?: boolean
  onResetMutations: () => void
}

const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function AvailabilityManager({
  data: schedules,
  dateOverrides = [],
  isPending,
  onCreateSchedule,
  onActivateSchedule,
  onDeleteSchedule,
  onUpdateSchedule,
  updateMutationStatus,
  toggleMutationStatus,
  onCreateDateOverride,
  onEditDateOverride,
  onDeleteDateOverride,
  onResetMutations,
}: AvailabilityManagerProps) {
  const [data, setData] = React.useState<Schedule[]>([])
  const [editingSchedule, setEditingSchedule] = React.useState<Schedule | null>(
    null,
  )
  const isMobile = useIsMobile()
  const hasResetRef = React.useRef(false)

  React.useEffect(() => {
    if (schedules) {
      setData(schedules)
      if (editingSchedule) {
        const updatedEditingSchedule = schedules.find(
          (s) => s._id === editingSchedule._id,
        )
        if (updatedEditingSchedule) {
          const hasScheduleChanged =
            JSON.stringify(editingSchedule) !==
            JSON.stringify(updatedEditingSchedule)
          setEditingSchedule(updatedEditingSchedule)

          if (hasScheduleChanged && !hasResetRef.current) {
            hasResetRef.current = true
            onResetMutations()
            setTimeout(() => {
              hasResetRef.current = false
            }, 100)
          }
        }
      }
    }
  }, [schedules, editingSchedule?._id])

  const handleCreateNewSchedule = async () => {
    const defaultWeeklyHours = [
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 6, isOpen: false, openTime: '09:00', closeTime: '17:00' },
    ]

    const newSchedule = {
      name: 'New Schedule',
      isActive: false,
      weeklyHours: defaultWeeklyHours,
    }

    try {
      const createdSchedule = await onCreateSchedule(newSchedule)
      if (createdSchedule) {
        setEditingSchedule(createdSchedule)
      }
    } catch (error) {
      console.error('Failed to create schedule:', error)
    }
  }

  const handleScheduleSelect = (scheduleId: string) => {
    const schedule = data.find((s) => s._id === scheduleId)
    if (schedule) {
      setEditingSchedule(schedule)
    }
  }

  const handleUpdateSchedule = (updatedSchedule: Schedule) => {
    onUpdateSchedule(updatedSchedule)
    setEditingSchedule(updatedSchedule)
  }

  const handleActivateSchedule = (scheduleId: string, isActive: boolean) => {
    onActivateSchedule(scheduleId, isActive)
    if (editingSchedule && editingSchedule._id === scheduleId) {
      setEditingSchedule({ ...editingSchedule, isActive })
    }
  }

  const handleBackToList = () => {
    setEditingSchedule(null)
    onResetMutations()
  }

  if (editingSchedule) {
    return (
      <ScheduleEditor
        schedule={editingSchedule}
        onBack={handleBackToList}
        onUpdate={handleUpdateSchedule}
        onActivateSchedule={handleActivateSchedule}
        updateMutationStatus={updateMutationStatus}
        toggleMutationStatus={toggleMutationStatus}
      />
    )
  }

  if (isPending) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          <ScheduleSkeleton />
          <ScheduleSkeleton />
          <ScheduleSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Weekly Schedules Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Weekly Schedules</h2>
            <p className="text-sm text-gray-600">
              Create and manage your regular business hours
            </p>
          </div>
          <Button onClick={handleCreateNewSchedule}>
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>

        {data.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CalendarX className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Business Hours Set
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't created any schedules yet. Create your first
                schedule to set your business hours.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleCreateNewSchedule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {data.map((schedule) => (
              <Card
                key={schedule._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <div className={`${isMobile ? 'mb-1' : ''}`}>
                            {isMobile && (
                              <div className="h-5 flex items-start">
                                {schedule.isActive && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Active
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold mr-1">
                              {schedule.name}
                            </h3>
                            {!isMobile && schedule.isActive && (
                              <Badge variant="secondary">Active</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {/* {schedule.description} */}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-3">
                        <Switch
                          id={`schedule-${schedule._id}`}
                          checked={schedule.isActive}
                          onCheckedChange={(checked) =>
                            handleActivateSchedule(schedule._id, checked)
                          }
                          className={
                            schedule.isActive
                              ? 'data-[state=checked]:bg-[rgba(101,197,103,1)]'
                              : ''
                          }
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleScheduleSelect(schedule._id)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {!isMobile ? 'Edit' : ''}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleScheduleSelect(schedule._id)}
                          >
                            Edit Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!schedule.isActive && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Schedule
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {schedule.name}"? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      onDeleteSchedule(schedule._id)
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Date Overrides Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Special Dates</h2>
            <p className="text-sm text-gray-600">
              Add dates with different hours or closures that override your
              active schedule
            </p>
          </div>
          <Button onClick={onCreateDateOverride} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Add Special Date
          </Button>
        </div>

        {dateOverrides.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium mb-2">No Special Dates</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add holidays, special events, or temporary schedule changes
              </p>
              <Button
                onClick={onCreateDateOverride}
                variant="outline"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Add Your First Special Date
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {dateOverrides
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((override) => (
                <Card
                  key={override._id}
                  className="hover:shadow-sm transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{override.name}</h4>
                            <Badge
                              variant={
                                override.isOpen ? 'secondary' : 'outline'
                              }
                              className={override.isOpen ? '' : 'text-red-600'}
                            >
                              {override.isOpen ? 'Special Hours' : 'Closed'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(override.date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {override.isOpen &&
                            override.openTime &&
                            override.closeTime
                              ? `${formatTime12Hour(override.openTime)} - ${formatTime12Hour(override.closeTime)}`
                              : override.isOpen
                                ? 'Open (using active schedule hours)'
                                : 'Closed all day'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditDateOverride(override._id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteDateOverride(override._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <CalendarX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
