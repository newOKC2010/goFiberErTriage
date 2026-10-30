'use client'

import { useState, useEffect, useRef } from 'react'
import HeaderFiltersYear from './headerFiltersYear'
import { DatePickerProps } from './handler/datePickerTypes'
import { 
  THAI_MONTHS, 
  THAI_DAYS, 
  formatThaiDate, 
  formatAPIDate, 
  getDaysInMonth, 
  navigateMonth, 
  createNewDateWithYear, 
  isSameDate, 
  isToday 
} from './handler/datePickerHandlers'

interface DateRangePickerProps {
  startDate: string
  endDate?: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

export default function HeaderFiltersDateRange({ startDate, endDate, onStartDateChange, onEndDateChange }: DateRangePickerProps) {
  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const calendarRef = useRef<HTMLDivElement>(null)

  const handleDateSelect = (date: Date) => {
    const apiDate = formatAPIDate(date)
    if (showCalendar === 'start') {
      onStartDateChange(apiDate)
    } else if (showCalendar === 'end') {
      onEndDateChange(apiDate)
    }
    setShowCalendar(null)
  }

  const handleNavigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => navigateMonth(prev, direction))
  }

  const handleYearChange = (year: number) => {
    setCurrentDate(prev => createNewDateWithYear(prev, year))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(null)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showCalendar])

  return (
    <div ref={calendarRef} className="flex flex-col sm:flex-row gap-4 flex-1">
      {/* Start Date */}
      <div className="flex-1 max-w-full sm:max-w-xs relative">
        <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-2">
          <span className="material-symbols-outlined text-blue-500 text-sm">Calendar_Check</span>
          วันที่เริ่มต้น
        </label>
        
        <button
          type="button"
          onClick={() => setShowCalendar(showCalendar === 'start' ? null : 'start')}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm 
                   hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-all duration-200 font-bold text-gray-900 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className={startDate ? "text-gray-900 font-bold" : "text-gray-500 font-bold"}>
              {startDate ? formatThaiDate(startDate) : "เลือกวันที่"}
            </span>
            <span className="material-symbols-outlined text-gray-400">
              {showCalendar === 'start' ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </button>

        {showCalendar === 'start' && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg 
                          animate-in fade-in-0 zoom-in-95 duration-200 p-4">
            
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => handleNavigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-gray-600 font-bold">chevron_left</span>
              </button>
              
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">{THAI_MONTHS[currentDate.getMonth()]}</div>
                <HeaderFiltersYear currentYear={currentDate.getFullYear()} onYearSelect={handleYearChange} />
              </div>
              
              <button onClick={() => handleNavigateMonth('next')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-gray-600 font-bold">chevron_right</span>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {THAI_DAYS.map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && handleDateSelect(date)}
                  disabled={!date}
                  className={`h-10 rounded-lg text-sm font-bold transition-colors cursor-pointer
                    ${!date ? 'invisible' : 'hover:bg-blue-200 focus:bg-blue-100'}
                    ${date && isSameDate(formatAPIDate(date), startDate) ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-900'}
                    ${date && isToday(date) ? 'ring-2 ring-blue-300' : ''}`}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => handleDateSelect(new Date())} className="w-full py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors border border-blue-200 cursor-pointer">
                วันนี้
              </button>
            </div>
          </div>
        )}
      </div>

      {/* End Date */}
      <div className="flex-1 max-w-full sm:max-w-xs relative">
        <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-2">
          <span className="material-symbols-outlined text-blue-500 text-sm">Event</span>
          วันที่สิ้นสุด
        </label>
        
        <button
          type="button"
          onClick={() => setShowCalendar(showCalendar === 'end' ? null : 'end')}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm 
                   hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   transition-all duration-200 font-bold text-gray-900 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className={endDate ? "text-gray-900 font-bold" : "text-gray-500 font-bold"}>
              {endDate ? formatThaiDate(endDate) : "เลือกวันที่"}
            </span>
            <span className="material-symbols-outlined text-gray-400">
              {showCalendar === 'end' ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </button>

        {showCalendar === 'end' && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg 
                          animate-in fade-in-0 zoom-in-95 duration-200 p-4">
            
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => handleNavigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-gray-600 font-bold">chevron_left</span>
              </button>
              
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 mb-1">{THAI_MONTHS[currentDate.getMonth()]}</div>
                <HeaderFiltersYear currentYear={currentDate.getFullYear()} onYearSelect={handleYearChange} />
              </div>
              
              <button onClick={() => handleNavigateMonth('next')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-gray-600 font-bold">chevron_right</span>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {THAI_DAYS.map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && handleDateSelect(date)}
                  disabled={!date}
                  className={`h-10 rounded-lg text-sm font-bold transition-colors cursor-pointer
                    ${!date ? 'invisible' : 'hover:bg-blue-200 focus:bg-blue-100'}
                    ${date && isSameDate(formatAPIDate(date), endDate || '') ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-900'}
                    ${date && isToday(date) ? 'ring-2 ring-blue-300' : ''}`}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => handleDateSelect(new Date())} className="w-full py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors border border-blue-200 cursor-pointer">
                วันนี้
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
