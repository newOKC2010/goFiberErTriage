// DatePicker logic functions

// Constants
export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
]

export const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
export const EN_DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Date formatting functions
export const formatThaiDate = (dateString: string): string => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-').map(Number)
  return `${day} ${THAI_MONTHS[month - 1]} ${year + 543}`
}

export const formatDisplayDate = (dateString: string, lang: string): string => {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-').map(Number)
  if (lang === 'en') return `${day} ${EN_MONTHS[month - 1]} ${year}`
  return `${day} ${THAI_MONTHS[month - 1]} ${year + 543}`
}

export const formatAPIDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Calendar utility functions
export const getDaysInMonth = (date: Date): (Date | null)[] => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  
  const days: (Date | null)[] = []
  // Empty cells for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  // Days of current month
  for (let day = 1; day <= lastDate; day++) {
    days.push(new Date(year, month, day))
  }
  return days
}

export const getTodayDate = (): string => {
  return formatAPIDate(new Date())
}

// Navigation functions
export const navigateMonth = (currentDate: Date, direction: 'prev' | 'next'): Date => {
  const newDate = new Date(currentDate)
  if (direction === 'prev') {
    newDate.setMonth(currentDate.getMonth() - 1)
  } else {
    newDate.setMonth(currentDate.getMonth() + 1)
  }
  return newDate
}

export const createNewDateWithYear = (currentDate: Date, year: number): Date => {
  return new Date(year, currentDate.getMonth(), 1)
}

// Date validation and comparison
export const isSameDate = (date1: string, date2: string): boolean => {
  return date1 === date2
}

export const isToday = (date: Date): boolean => {
  return formatAPIDate(date) === getTodayDate()
}

export const isPastOrToday = (date: Date): boolean => {
  return formatAPIDate(date) <= getTodayDate()
}

export const isFuture = (date: Date): boolean => {
  return formatAPIDate(date) > getTodayDate()
}
