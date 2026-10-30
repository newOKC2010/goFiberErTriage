// Year Selector logic functions

// Year generation and formatting
export const generateYearRange = (): number[] => {
  const thisYear = new Date().getFullYear()
  const startYear = thisYear - 20
  const endYear = thisYear
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
}

export const formatThaiYear = (year: number): string => {
  return `${year + 543}`
}

// Click outside handler utility
export const createClickOutsideHandler = (
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
) => {
  return (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      callback()
    }
  }
}

// Year selection handlers
export const handleYearSelection = (
  year: number,
  onYearSelect: (year: number) => void,
  setShowYears: (show: boolean) => void
) => {
  onYearSelect(year)
  setShowYears(false)
}

export const toggleYearDropdown = (
  currentState: boolean,
  setShowYears: (show: boolean) => void
) => {
  setShowYears(!currentState)
}
