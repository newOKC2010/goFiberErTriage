// Handlers และ utilities สำหรับ Dropdown
import { DropdownOption } from '@/components/dropdown/handler/TYPE'

// สร้าง handlers สำหรับ dropdown
export const createDropdownHandlers = (
  isOpen: boolean,
  isMobile: boolean,
  touchStartY: number,
  setIsOpen: (open: boolean) => void,
  setSearchTerm: (term: string) => void,
  setTouchStartY: (y: number) => void,
  onChange: (value: string) => void,
  onOpen?: () => void
) => {
  const handleButtonClick = (event?: React.MouseEvent | React.TouchEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    if (!isOpen && onOpen) {
      onOpen()
    }
    setIsOpen(!isOpen)
  }

  const handleSelect = (option: DropdownOption) => {
    onChange(option.value)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      setTouchStartY(e.touches[0].clientY)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent, option: DropdownOption) => {
    if (isMobile) {
      const touchEndY = e.changedTouches[0].clientY
      const diff = Math.abs(touchEndY - touchStartY)
      // ถ้าเลื่อนน้อยกว่า 10px ถือว่าเป็นการ tap
      if (diff < 10) {
        handleSelect(option)
      }
    }
  }

  return {
    handleButtonClick,
    handleSelect,
    handleTouchStart,
    handleTouchEnd
  }
}

// Utility สำหรับ CSS classes
export const getDropdownClasses = (className: string) => {
  return `relative w-full ${className}`
}

export const getDropdownMenuStyle = (isOpen: boolean) => {
  return { zIndex: isOpen ? 99999 : 'auto' }
}

// Utility สำหรับ mobile touch styles
export const getMobileTouchStyles = () => {
  return {
    touchAction: 'manipulation' as const,
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none' as const
  }
}