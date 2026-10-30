'use client'

import { useState, useEffect, useRef } from 'react'
import { DatePickerProps } from './handler/datePickerTypes'
import HeaderFiltersYear from './headerFiltersYear'
import { 
  THAI_MONTHS, EN_MONTHS,
  THAI_DAYS, EN_DAYS,
  formatDisplayDate, 
  formatAPIDate, 
  getDaysInMonth, 
  navigateMonth, 
  isSameDate, 
  isToday,
  isPastOrToday,
  isFuture,
  getTodayDate
} from './handler/datePickerHandlers'

export default function HeaderFiltersDate({ selectedDate, onDateChange, closeCalendar, label = 'วันที่', placeholder = 'เลือกวันที่', lang = 'th', disablePastAndToday = false }: DatePickerProps) {
    const MONTHS = lang === 'en' ? EN_MONTHS : THAI_MONTHS
    const DAYS   = lang === 'en' ? EN_DAYS   : THAI_DAYS
    const [showCalendar, setShowCalendar] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const calendarRef = useRef<HTMLDivElement>(null)

    const today = new Date()
    const isAtMinMonth = disablePastAndToday &&
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth()

    // disable next เมื่ออยู่ที่เดือนปัจจุบัน (ไม่ให้ไปอนาคต)
    const isAtMaxMonth =
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth()

    const handleDateSelect = (date: Date) => {
        const apiDate = formatAPIDate(date)
        onDateChange(apiDate)
        setShowCalendar(false)
    }

    const handleNavigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => navigateMonth(prev, direction))
    }

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false)
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

    // Close calendar when parent requests it
    useEffect(() => {
        if (closeCalendar) setShowCalendar(false)
    }, [closeCalendar])

    return (
        <div ref={calendarRef} className="flex-1 max-w-full sm:max-w-xs relative">
            <label className="flex items-center gap-2 text-xs font-bold text-sky-500 mb-1 ml-1">
                <span className="material-symbols-outlined text-sky-400 text-xl"
                    style={{ fontVariationSettings: "'wght' 700" }}>
                    calendar_month
                </span>
                {label}
            </label>

            <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full px-4 py-3 text-left bg-white border border-sky-200 rounded-xl shadow-sm
                         hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400
                         transition-all duration-200 font-bold text-sky-700 cursor-pointer"
            >
                <div className="flex items-center justify-between">
                    <span className={selectedDate ? "text-sky-700 font-bold text-sm" : "text-sky-300 font-bold text-sm"}>
                        {selectedDate ? formatDisplayDate(selectedDate, lang) : placeholder}
                    </span>
                    <span className="material-symbols-outlined text-sky-300">
                        {showCalendar ? 'expand_less' : 'expand_more'}
                    </span>
                </div>
            </button>

            {/* Calendar Popup */}
            {showCalendar && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-sky-100 rounded-xl shadow-lg
                                animate-in fade-in-0 zoom-in-95 duration-200 p-4">

                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => handleNavigateMonth('prev')}
                            disabled={isAtMinMonth}
                            className="p-2 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sky-400 font-bold">chevron_left</span>
                        </button>

                        <div className="flex flex-col items-center gap-1">
                            <div className="text-base font-bold text-sky-700">
                                {MONTHS[currentDate.getMonth()]}
                            </div>
                            <HeaderFiltersYear
                                currentYear={currentDate.getFullYear()}
                                onYearSelect={(year) => setCurrentDate(new Date(year, currentDate.getMonth(), 1))}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => handleNavigateMonth('next')}
                            disabled={isAtMaxMonth}
                            className="p-2 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sky-400 font-bold">chevron_right</span>
                        </button>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-xs font-bold text-sky-400 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentDate).map((date, index) => {
                            const disabled = !date || (disablePastAndToday && !!date && isPastOrToday(date)) || (!!date && isFuture(date))
                            const isSelected = !!date && isSameDate(formatAPIDate(date), selectedDate)
                            const isTodayDate = !!date && isToday(date)
                            return (
                                <button
                                    type="button"
                                    key={index}
                                    onClick={() => date && handleDateSelect(date)}
                                    disabled={disabled}
                                    className={`h-9 rounded-lg text-xs font-bold transition-colors
                                        ${!date ? 'invisible' : ''}
                                        ${isSelected ? 'bg-sky-500 text-white hover:bg-sky-600' : ''}
                                        ${!isSelected && !disabled ? 'text-sky-800 hover:bg-sky-100 cursor-pointer' : ''}
                                        ${disabled && !!date ? 'text-gray-300 cursor-not-allowed' : ''}
                                        ${isTodayDate && !isSelected ? 'ring-2 ring-sky-300' : ''}`}
                                >
                                    {date?.getDate()}
                                </button>
                            )
                        })}
                    </div>

                    {/* Today Button */}
                    {!disablePastAndToday && (
                        <div className="mt-4 pt-3 border-t border-sky-100">
                            <button
                                type="button"
                                onClick={() => handleDateSelect(new Date())}
                                className="w-full py-2 text-xs bg-sky-50 hover:bg-sky-100 text-sky-600
                                         font-bold rounded-lg transition-colors border border-sky-200 cursor-pointer"
                            >
                                {lang === 'en' ? 'Today' : 'วันนี้'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
