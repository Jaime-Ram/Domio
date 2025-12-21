'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { nl } from 'date-fns/locale'

interface MockShift {
  id: string
  employeeId: string
  employeeName: string
  employeeEmail: string
  date: Date
  startTime: string
  endTime: string
  role?: string
}

interface MockScheduleProps {
  weekStart?: Date
}

export function MockSchedule({ weekStart }: MockScheduleProps) {
  const startDate = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
  
  // Mock shifts data
  const mockShifts: MockShift[] = [
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'Jan Jansen',
      employeeEmail: 'jan@example.com',
      date: addDays(startDate, 0), // Monday
      startTime: '09:00',
      endTime: '17:00',
      role: 'Server'
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'Maria de Vries',
      employeeEmail: 'maria@example.com',
      date: addDays(startDate, 0), // Monday
      startTime: '10:00',
      endTime: '18:00',
      role: 'Kok'
    },
    {
      id: '3',
      employeeId: 'emp1',
      employeeName: 'Jan Jansen',
      employeeEmail: 'jan@example.com',
      date: addDays(startDate, 1), // Tuesday
      startTime: '09:00',
      endTime: '17:00',
      role: 'Server'
    },
    {
      id: '4',
      employeeId: 'emp3',
      employeeName: 'Pieter Bakker',
      employeeEmail: 'pieter@example.com',
      date: addDays(startDate, 2), // Wednesday
      startTime: '11:00',
      endTime: '19:00',
      role: 'Bartender'
    },
    {
      id: '5',
      employeeId: 'emp2',
      employeeName: 'Maria de Vries',
      employeeEmail: 'maria@example.com',
      date: addDays(startDate, 3), // Thursday
      startTime: '10:00',
      endTime: '18:00',
      role: 'Kok'
    },
    {
      id: '6',
      employeeId: 'emp1',
      employeeName: 'Jan Jansen',
      employeeEmail: 'jan@example.com',
      date: addDays(startDate, 4), // Friday
      startTime: '09:00',
      endTime: '17:00',
      role: 'Server'
    },
    {
      id: '7',
      employeeId: 'emp3',
      employeeName: 'Pieter Bakker',
      employeeEmail: 'pieter@example.com',
      date: addDays(startDate, 5), // Saturday
      startTime: '12:00',
      endTime: '20:00',
      role: 'Bartender'
    },
    {
      id: '8',
      employeeId: 'emp2',
      employeeName: 'Maria de Vries',
      employeeEmail: 'maria@example.com',
      date: addDays(startDate, 6), // Sunday
      startTime: '10:00',
      endTime: '18:00',
      role: 'Kok'
    },
  ]

  const getShiftsForDay = (day: Date) => {
    return mockShifts.filter(shift => isSameDay(shift.date, day))
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rooster</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Week header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {format(day, 'EEE', { locale: nl })}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {format(day, 'd MMM', { locale: nl })}
                  </div>
                </div>
              ))}
            </div>

            {/* Shifts grid */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, dayIndex) => {
                const dayShifts = getShiftsForDay(day)
                return (
                  <div key={dayIndex} className="min-h-[200px] border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                    {dayShifts.length > 0 ? (
                      <div className="space-y-2">
                        {dayShifts.map((shift) => (
                          <div
                            key={shift.id}
                            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2"
                          >
                            <div className="flex items-start gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-xs">
                                  {getInitials(shift.employeeName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                  {shift.employeeName}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {shift.startTime} - {shift.endTime}
                                </p>
                                {shift.role && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {shift.role}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-4">
                        Geen shifts
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



