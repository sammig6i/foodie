import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function generateTimeSlots() {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  return slots
}

export function TimePicker({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (value: string) => void
  label: string
}) {
  const [selectedTime, setSelectedTime] = React.useState<string>(value)
  const timeSlots = generateTimeSlots()

  React.useEffect(() => {
    setSelectedTime(value)
  }, [value])

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    onChange(time)
  }

  const handleManualTimeChange = (inputValue: string) => {
    setSelectedTime(inputValue)
  }

  const handleManualTimeBlur = (inputValue: string) => {
    setSelectedTime(inputValue)
    onChange(inputValue)
  }

  const formatDisplayTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-28 sm:w-32 justify-start text-left font-normal text-xs sm:text-sm"
        >
          {formatDisplayTime(selectedTime)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 sm:w-80 p-0" align="start">
        <Card className="gap-0 p-0">
          <CardContent className="p-0">
            <div className="border-b p-3 sm:p-4">
              <h4 className="font-medium text-sm">{label}</h4>
            </div>
            <div className="max-h-64 overflow-y-auto p-3 sm:p-4">
              <div className="grid gap-1 sm:gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    onClick={() => handleTimeSelect(time)}
                    className="w-full justify-start shadow-none text-xs sm:text-sm"
                    size="sm"
                  >
                    {formatDisplayTime(time)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t p-3 sm:p-4">
            <div className="w-full">
              <Label
                htmlFor="manual-time"
                className="text-xs text-muted-foreground"
              >
                Or enter manually:
              </Label>
              <Input
                id="manual-time"
                type="time"
                value={selectedTime}
                onChange={(e) => handleManualTimeChange(e.target.value)}
                onBlur={(e) => handleManualTimeBlur(e.target.value)}
                className="mt-1 text-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
