"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, setMonth, setYear, getYear, getMonth } from "date-fns"

interface WeekCalendarProps {
  onDateSelect?: (date: Date) => void
  initialDate?: Date
}

const WeekCalendar = ({ onDateSelect, initialDate = new Date() }: WeekCalendarProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(initialDate, { weekStartsOn: 1 }) // Start from Monday
  )
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(getYear(currentWeekStart))
  const [pickerMonth, setPickerMonth] = useState(getMonth(currentWeekStart))

  // Generate the 7 days of the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  const handleGoToDate = () => {
    const newDate = setYear(setMonth(new Date(), pickerMonth), pickerYear)
    setCurrentWeekStart(startOfWeek(newDate, { weekStartsOn: 1 }))
    setSelectedDate(newDate)
    setShowDatePicker(false)
  }

  const handleGoToToday = () => {
    const today = new Date()
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }))
    setSelectedDate(today)
    setPickerYear(getYear(today))
    setPickerMonth(getMonth(today))
    setShowDatePicker(false)
  }

  const isToday = (date: Date) => isSameDay(date, new Date())
  const isSelected = (date: Date) => isSameDay(date, selectedDate)

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Generate years from 1900 to 2100
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i)

  return (
    <div className="w-full relative">
      {/* Header with month/year and navigation */}
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={() => {
            setPickerYear(getYear(currentWeekStart))
            setPickerMonth(getMonth(currentWeekStart))
            setShowDatePicker(!showDatePicker)
          }}
          className="font-semibold text-lg flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
        >
          {format(currentWeekStart, "MMMM yyyy")}
          <CalendarIcon className="w-4 h-4" />
        </button>
        <div className="flex gap-1">
          <button 
            onClick={handlePrevWeek}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNextWeek}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Picker Dropdown */}
      {showDatePicker && (
        <div className="absolute top-12 left-0 right-0 bg-gray-800 rounded-2xl p-4 shadow-xl z-50 border border-white/10">
          <div className="space-y-4">
            {/* Month Selector */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Month</label>
              <select
                value={pickerMonth}
                onChange={(e) => setPickerMonth(Number(e.target.value))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Year</label>
              <select
                value={pickerYear}
                onChange={(e) => setPickerYear(Number(e.target.value))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleGoToToday}
                className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleGoToDate}
                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Go to Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="text-center text-xs text-gray-400 font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar dates - only current week */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => handleDateClick(date)}
            className={`aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
              isSelected(date)
                ? "bg-blue-500 text-white shadow-lg scale-105"
                : isToday(date)
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:bg-white/5"
            }`}
          >
            {format(date, "d")}
          </button>
        ))}
      </div>
    </div>
  )
}

export default WeekCalendar
