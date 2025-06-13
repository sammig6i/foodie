import AvailabilityManager from '@/components/features/business-hours/AvailabilityManager'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { useQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authed/admin/availability')({
  component: AvailabilityComponent,
})

function AvailabilityComponent() {
  const { data: schedules, isPending } = useQuery(
    convexQuery(api.availability.getSchedules, {}),
  )

  const { data: dateOverrides } = useQuery(
    convexQuery(api.availability.getDateOverrides, {}),
  )

  const deleteScheduleMutation = useMutation({
    mutationFn: useConvexMutation(api.availability.deleteSchedule),
    onSuccess: () => {
      toast.success('Schedule deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete schedule')
    },
  })

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteScheduleMutation.mutateAsync({
        scheduleId: scheduleId as Id<'schedules'>,
      })
    } catch (error) {
      console.error('Failed to delete schedule:', error)
    }
  }

  const toggleScheduleMutation = useMutation({
    mutationFn: useConvexMutation(
      api.availability.toggleScheduleActive,
    ).withOptimisticUpdate((localStore, args) => {
      const existingSchedules = localStore.getQuery(
        api.availability.getSchedules,
        {},
      )
      if (existingSchedules !== undefined) {
        const { scheduleId, isActive } = args

        const updatedSchedules = existingSchedules.map((schedule) => {
          if (schedule._id === scheduleId) {
            return { ...schedule, isActive }
          } else if (isActive) {
            return { ...schedule, isActive: false }
          }
          return schedule
        })

        localStore.setQuery(api.availability.getSchedules, {}, updatedSchedules)
      }

      const currentBusinessHours = localStore.getQuery(
        api.availability.getCurrentBusinessHours,
        {},
      )
      if (
        currentBusinessHours !== undefined &&
        currentBusinessHours !== null &&
        args.isActive
      ) {
        const targetSchedule = existingSchedules?.find(
          (s) => s._id === args.scheduleId,
        )
        if (targetSchedule) {
          localStore.setQuery(
            api.availability.getCurrentBusinessHours,
            {},
            {
              schedule: { ...targetSchedule, isActive: true },
              todayOverride: currentBusinessHours.todayOverride || null,
              weekOverrides: currentBusinessHours.weekOverrides || [],
            },
          )
        }
      } else if (currentBusinessHours !== undefined && !args.isActive) {
        const hasActiveSchedule = existingSchedules?.some(
          (s) => s._id !== args.scheduleId && s.isActive,
        )

        if (!hasActiveSchedule) {
          localStore.setQuery(
            api.availability.getCurrentBusinessHours,
            {},
            null,
          )
        }
      }
    }),
    onSuccess: (_, variables) => {
      if (variables.isActive) {
        toast.success('Schedule activated successfully')
      } else {
        toast.success('Schedule deactivated successfully')
      }
    },
    onError: (error) => {
      console.error('Failed to toggle schedule:', error)
      toast.error('Failed to update schedule')
    },
  })

  const handleActivateSchedule = async (
    scheduleId: string,
    isActive: boolean,
  ) => {
    try {
      await toggleScheduleMutation.mutateAsync({
        scheduleId: scheduleId as Id<'schedules'>,
        isActive,
      })
    } catch (error) {
      console.error('Failed to toggle schedule:', error)
    }
  }

  const addScheduleMutation = useMutation({
    mutationFn: useConvexMutation(api.availability.addSchedule),
    onSuccess: () => {
      toast.success('Schedule created successfully')
    },
    onError: () => {
      toast.error('Failed to create schedule')
    },
  })

  const handleCreateSchedule = async (schedule: any) => {
    try {
      const result = await addScheduleMutation.mutateAsync(schedule)
      if (!result) {
        throw new Error('Failed to create schedule - no result returned')
      }
      return result
    } catch (error) {
      console.error('Failed to create schedule:', error)
      throw error
    }
  }

  const updateScheduleMutation = useMutation({
    mutationFn: useConvexMutation(
      api.availability.updateSchedule,
    ).withOptimisticUpdate((localStore, args) => {
      const existingSchedules = localStore.getQuery(
        api.availability.getSchedules,
        {},
      )
      if (existingSchedules !== undefined) {
        const { scheduleId, ...updateFields } = args

        const filteredUpdateFields: any = {}
        for (const [key, value] of Object.entries(updateFields)) {
          if (value !== undefined) {
            filteredUpdateFields[key] = value
          }
        }

        const updatedSchedules = existingSchedules.map((schedule) =>
          schedule._id === scheduleId
            ? ({ ...schedule, ...filteredUpdateFields } as typeof schedule)
            : schedule,
        )
        localStore.setQuery(api.availability.getSchedules, {}, updatedSchedules)
      }
    }),
  })

  const handleUpdateSchedule = async (schedule: any) => {
    return updateScheduleMutation.mutateAsync({
      scheduleId: schedule._id,
      name: schedule.name,
      weeklyHours: schedule.weeklyHours,
    })
  }

  const handleResetMutations = () => {
    toggleScheduleMutation.reset()
    updateScheduleMutation.reset()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Business Hours</h1>
        <p className="text-muted-foreground">
          Manage your business hours and availability
        </p>
      </div>
      <div>
        <AvailabilityManager
          data={schedules}
          dateOverrides={dateOverrides}
          isPending={isPending}
          onCreateSchedule={handleCreateSchedule}
          onActivateSchedule={handleActivateSchedule}
          onDeleteSchedule={handleDeleteSchedule}
          onUpdateSchedule={handleUpdateSchedule}
          updateMutationStatus={{
            isLoading: updateScheduleMutation.isPending,
            isSuccess: updateScheduleMutation.isSuccess,
            isError: updateScheduleMutation.isError,
          }}
          toggleMutationStatus={{
            isLoading: toggleScheduleMutation.isPending,
            isSuccess: toggleScheduleMutation.isSuccess,
            isError: toggleScheduleMutation.isError,
          }}
          onCreateDateOverride={() => {
            console.log('Create date override')
          }}
          onEditDateOverride={(overrideId) => {
            console.log('Edit date override:', overrideId)
          }}
          onDeleteDateOverride={(overrideId) => {
            console.log('Delete date override:', overrideId)
          }}
          onResetMutations={handleResetMutations}
        />
      </div>
    </div>
  )
}
