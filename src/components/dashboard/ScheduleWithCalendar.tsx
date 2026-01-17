"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, getYear, getMonth, setMonth, setYear } from "date-fns"
import { MedicalFileFreeIcons } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

// Sample schedule data - in real app, this would come from a database/API
const scheduleData = [
  { id: 1, date: new Date(2026, 0, 17), time: "08:00 AM", title: "Health checkup", status: "Upcoming", color: "primary", borderColor: "primary",bgColor: "accent", icon: MedicalFileFreeIcons },
  { id: 2, date: new Date(2026, 0, 17), time: "10:00 AM", title: "Create Landing Page", status: "Working On", color: "secondary-foreground", borderColor: "secondary-foreground",bgColor: "secondary", icon: MedicalFileFreeIcons },
  { id: 3, date: new Date(2026, 0, 18), time: "09:00 AM", title: "Team Meeting", status: "Upcoming", color: "primary", borderColor: "primary",bgColor: "accent", icon: MedicalFileFreeIcons },
  { id: 4, date: new Date(2026, 0, 20), time: "02:00 PM", title: "Doctor Appointment", status: "Upcoming", color: "secondary-foreground", borderColor: "secondary-foreground",bgColor: "secondary", icon: MedicalFileFreeIcons },
  { id: 5, date: new Date(2026, 0, 22), time: "11:00 AM", title: "Project Review", status: "Working On", color: "primary", borderColor: "primary",bgColor: "accent", icon: MedicalFileFreeIcons },
]

const ScheduleWithCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get schedules for selected date
  const schedulesForDate = scheduleData.filter(item => 
    isSameDay(item.date, selectedDate)
  )

  // Generate calendar days for current month view
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = startDate
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }

  const calendarDays = generateCalendarDays()

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowCalendar(false)
  }

  const hasSchedule = (date: Date) => {
    return scheduleData.some(item => isSameDay(item.date, date))
  }

  const isCurrentMonth = (date: Date) => {
    return getMonth(date) === getMonth(currentMonth)
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i)

  return (
    <div className="h-full bg-white rounded-3xl p-6 text-black relative">
      {/* Header with calendar icon */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-lg">Upcoming schedule</h3>
        <button 
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors hover:cursor-pointer"
        >
          <CalendarIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-5">
        {format(selectedDate, "EEEE, dd MMMM, yyyy")}
      </p>

      {/* Calendar Popup */}
      {showCalendar && (
        <div className="absolute top-16 right-4 bg-white rounded-2xl p-4 shadow-2xl z-50 border border-gray-200 w-80">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              <select
                value={getMonth(currentMonth)}
                onChange={(e) => setCurrentMonth(setMonth(currentMonth, Number(e.target.value)))}
                className="bg-gray-100 text-black rounded-lg px-2 py-1 text-sm focus:outline-none"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <select
                value={getYear(currentMonth)}
                onChange={(e) => setCurrentMonth(setYear(currentMonth, Number(e.target.value)))}
                className="bg-gray-100 text-black rounded-lg px-2 py-1 text-sm focus:outline-none"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => (
              <div key={day} className="text-center text-xs text-gray-400 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative ${
                  isSameDay(date, selectedDate)
                    ? "bg-blue-500 text-white"
                    : isSameDay(date, new Date())
                    ? "bg-blue-100 text-blue-600"
                    : isCurrentMonth(date)
                    ? "text-gray-800 hover:bg-gray-100"
                    : "text-gray-300"
                }`}
              >
                {format(date, "d")}
                {hasSchedule(date) && (
                  <div className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    isSameDay(date, selectedDate) ? "bg-white" : "bg-blue-500"
                  }`} />
                )}
              </button>
            ))}
          </div>

          {/* Today Button */}
          <button
            onClick={() => {
              const today = new Date()
              setCurrentMonth(today)
              setSelectedDate(today)
              setShowCalendar(false)
            }}
            className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Go to Today
          </button>
        </div>
      )}

      {/* Schedule List */}
      <div className="space-y-3 mb-5">
        {schedulesForDate.length > 0 ? (
          schedulesForDate.map((schedule) => (
            <div key={schedule.id} className={`flex items-center gap-3 p-3 bg-${schedule.bgColor} border-1 border-${schedule.borderColor} rounded-2xl backdrop-blur`}>
              <div className="text-center min-w-[70px]">
                <p className="text-sm font-medium text-black">{schedule.time}</p>
              </div>
              <div className={`w-10 h-10 bg-white text-${schedule.color} rounded-xl flex items-center justify-center`}>
                <HugeiconsIcon icon={schedule.icon} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-black">{schedule.title}</p>
                <p className="text-xs text-gray-400">{schedule.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <CalendarIcon className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium">No schedule for this day</p>
            <p className="text-xs">Select another date or add a new event</p>
          </div>
        )}
      </div>

      {/* <button className="w-full bg-blue-500 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-blue-600 flex items-center justify-center gap-2 shadow-lg transition-all">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        Book now
      </button> */}
    </div>
  )
}

export default ScheduleWithCalendar
