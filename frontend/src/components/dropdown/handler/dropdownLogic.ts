
// Custom hooks และ logic สำหรับ Dropdown
import { useState, useRef, useEffect } from 'react'
import { DropdownOption } from '@/components/dropdown/handler/TYPE'

// Hook สำหรับจัดการ mobile detection
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Hook สำหรับจัดการ outside click
export const useOutsideClick = (
  isOpen: boolean,
  isMobile: boolean,
  inModal: boolean,
  onClose: () => void
) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleScroll = (event: Event) => {
      // ไม่ปิด dropdown ถ้า scroll ภายใน dropdown
      if (dropdownRef.current && event.target instanceof Node && dropdownRef.current.contains(event.target)) {
        return
      }
      // ไม่ปิดใน modal เพื่อป้องกันปัญหาบน mobile
      if (inModal) {
        return
      }
      // ไม่ปิด dropdown เมื่อ scroll ใน mobile
      if (isMobile) {
        return
      }
      if (isOpen) onClose()
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      if (!isMobile) {
        window.addEventListener('scroll', handleScroll, true)
        window.addEventListener('resize', handleScroll)
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('touchend', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [isOpen, inModal, isMobile, onClose])

  return dropdownRef
}

// Hook สำหรับ filter options
export const useFilteredOptions = (options: DropdownOption[], searchTerm: string) => {
  return options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
}

// Hook สำหรับ selected option
export const useSelectedOption = (options: DropdownOption[], value?: string) => {
  return options.find(option => option.value === value)
}
