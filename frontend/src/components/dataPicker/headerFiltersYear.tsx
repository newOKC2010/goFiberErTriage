'use client'

import { useState, useRef, useEffect } from 'react'
import { YearSelectorProps } from './handler/datePickerTypes'
import { 
  generateYearRange, 
  formatThaiYear, 
  createClickOutsideHandler, 
  handleYearSelection, 
  toggleYearDropdown 
} from './handler/yearSelectorHandlers'

export default function HeaderFiltersYear({ currentYear, onYearSelect }: YearSelectorProps) {
    const [showYears, setShowYears] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const years = generateYearRange()

    useEffect(() => {
        const handleClickOutside = createClickOutsideHandler(dropdownRef, () => setShowYears(false))

        if (showYears) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showYears])

    const handleYearSelect = (year: number) => {
        handleYearSelection(year, onYearSelect, setShowYears)
    }

    const handleDropdownToggle = () => {
        toggleYearDropdown(showYears, setShowYears)
    }

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={handleDropdownToggle}
                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold 
                         rounded-lg transition-colors cursor-pointer border border-blue-200 text-sm"
            >
                พ.ศ. {formatThaiYear(currentYear)}
                <span className="material-symbols-outlined text-xs ml-1">
                    {showYears ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {showYears && (
                <div className="absolute z-50 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg 
                                animate-in fade-in-0 zoom-in-95 duration-200 min-w-40 max-h-48 overflow-y-auto">
                    
                    {years.map((year) => (
                        <button
                            key={year}
                            onClick={() => handleYearSelect(year)}
                            className={`
                                w-full px-4 py-2 text-left font-bold transition-colors cursor-pointer text-sm
                                hover:bg-blue-100 focus:bg-blue-100
                                ${currentYear === year ? 
                                    'bg-blue-500 text-white hover:bg-blue-600' : 
                                    'text-gray-900'
                                }
                                ${year === years[years.length - 1] ? '' : 'border-b border-gray-100'}
                            `}
                        >
                            <div className="flex justify-between items-center">
                                <span>พ.ศ. {formatThaiYear(year)}</span>
                                <span className="text-xs opacity-75">({year})</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}