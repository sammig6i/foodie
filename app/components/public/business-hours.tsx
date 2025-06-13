import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import { Clock } from 'lucide-react'

const DAYS = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  if (dateStr === today.toISOString().split('T')[0]) {
    return 'Today'
  } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }
}

export default function BusinessHours() {
  const { data: businessHours } = useQuery(
    convexQuery(api.availability.getCurrentBusinessHours, {})
  )

  const { data: isOpen } = useQuery(
    convexQuery(api.availability.isCurrentlyOpen, {})
  )

  if (!businessHours?.schedule) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Business Hours</h3>
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Currently Closed
          </div>
        </div>
        <p className="text-gray-600">
          We're currently closed. Please check back soon for updated hours.
        </p>
      </div>
    )
  }

  const currentDay = new Date().getDay()
  const todayOverride = businessHours.todayOverride

  // Get upcoming overrides for the next 7 days (this week)
  const today = new Date()
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Business Hours</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isOpen 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isOpen ? 'Open Now' : 'Closed'}
        </div>
      </div>

      {/* Show this week's special dates/overrides */}
      {businessHours.weekOverrides && businessHours.weekOverrides.length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">This Week's Special Hours:</h4>
          {businessHours.weekOverrides.map((override: any) => {
            const isToday = override.date === today.toISOString().split('T')[0]
            
            return (
              <div 
                key={override._id}
                className={`p-2 rounded-md text-sm ${
                  isToday 
                    ? 'bg-blue-100 border border-blue-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">
                      {formatDate(override.date)}
                      {isToday && ' (Today)'}
                    </span>
                    <span className="text-gray-600 ml-2">- {override.name}</span>
                  </div>
                  <span className={`text-sm ${
                    override.isOpen ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {override.isOpen && override.openTime && override.closeTime
                      ? `${formatTime12Hour(override.openTime)} - ${formatTime12Hour(override.closeTime)}`
                      : override.isOpen 
                      ? 'Regular hours'
                      : 'Closed'
                    }
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Regular weekly schedule */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Regular Hours:</h4>
        {businessHours.schedule.weeklyHours.map((day: any) => {
          const isToday = day.dayOfWeek === currentDay && !todayOverride
          
          return (
            <div 
              key={day.dayOfWeek} 
              className={`flex justify-between py-1 ${
                isToday ? 'bg-blue-50 px-2 rounded font-medium' : ''
              }`}
            >
              <span className="text-gray-700">
                {DAYS[day.dayOfWeek]}
              </span>
              <span className="text-gray-900">
                {day.isOpen 
                  ? `${formatTime12Hour(day.openTime)} - ${formatTime12Hour(day.closeTime)}`
                  : 'Closed'
                }
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 