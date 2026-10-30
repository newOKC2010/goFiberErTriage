'use client'

import { useState } from 'react'
import {
  THAI_MONTHS,
  THAI_DAYS,
  formatAPIDate,
  getDaysInMonth,
  navigateMonth,
  isPastOrToday,
} from './handler/datePickerHandlers'
import HeaderFiltersYear from './headerFiltersYear'

interface MultiDateCalendarProps {
  selectedDates: string[]          // YYYY-MM-DD[]
  existingDates?: string[]         // เปิดจอง — เลือกไม่ได้ (สีชมพู)
  closedDates?: string[]           // ปิดจอง — เลือกไม่ได้ (สีเทา)
  onToggle: (date: string) => void // toggle เลือก/ยกเลิก
}

export default function MultiDateCalendar({ selectedDates, existingDates = [], closedDates = [], onToggle }: MultiDateCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const handleNav = (dir: 'prev' | 'next') =>
    setCurrentDate(prev => navigateMonth(prev, dir))

  const today = new Date()
  const isAtMinMonth =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth()

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => handleNav('prev')}
          disabled={isAtMinMonth}
          className="p-2 hover:bg-pink-100 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-pink-400 font-bold">chevron_left</span>
        </button>

        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-bold text-pink-700">
            {THAI_MONTHS[currentDate.getMonth()]}
          </span>
          <HeaderFiltersYear
            currentYear={currentDate.getFullYear()}
            onYearSelect={y => setCurrentDate(new Date(y, currentDate.getMonth(), 1))}
          />
        </div>

        <button
          type="button"
          onClick={() => handleNav('next')}
          className="p-2 hover:bg-pink-100 rounded-lg transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-pink-400 font-bold">chevron_right</span>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {THAI_DAYS.map(d => (
          <div key={d} className="text-center text-xs font-bold text-pink-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentDate).map((date, i) => {
          if (!date) return <div key={i} />

          const apiDate = formatAPIDate(date)
          const disabled = isPastOrToday(date)
          const isClosed = !disabled && closedDates.includes(apiDate)
          const isExisting = !disabled && !isClosed && existingDates.includes(apiDate)
          const isSelected = selectedDates.includes(apiDate)
          const isBlocked = disabled || isClosed || isExisting

          return (
            <button
              type="button"
              key={i}
              onClick={() => !isBlocked && onToggle(apiDate)}
              disabled={isBlocked}
              title={isClosed ? 'ปิดจอง' : isExisting ? 'เปิดจองแล้ว' : undefined}
              className={`h-10 rounded-lg text-xs font-bold transition-all
                ${disabled ? 'text-gray-200 cursor-not-allowed' : ''}
                ${isClosed ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : ''}
                ${isExisting ? 'bg-pink-200 text-pink-400 cursor-not-allowed' : ''}
                ${isSelected ? 'bg-pink-500 text-white scale-105 shadow-sm shadow-pink-200' : ''}
                ${!isBlocked && !isSelected ? 'text-pink-800 hover:bg-pink-100 cursor-pointer' : ''}
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-pink-100 text-xs font-bold text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-pink-500 inline-block" /> เลือกแล้ว</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-pink-200 inline-block" /> เปิดจอง</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block" /> ปิดจอง</span>
      </div>
    </div>
  )
}
