// Date Picker interfaces และ types

export interface DatePickerProps {
  selectedDate: string
  onDateChange: (date: string) => void
  closeCalendar?: number
  label?: string
  placeholder?: string
  lang?: string
  disablePastAndToday?: boolean
}

export interface YearSelectorProps {
  currentYear: number
  onYearSelect: (year: number) => void
}

// Calendar state types
export interface CalendarState {
  showCalendar: boolean
  currentDate: Date
}

export interface YearState {
  showYears: boolean
}
