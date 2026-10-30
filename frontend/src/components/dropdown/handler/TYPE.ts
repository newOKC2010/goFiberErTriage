// Types และ Interfaces สำหรับ Dropdown

export interface DropdownOption {
  value: string
  label: string
  color?: string
}

export interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchable?: boolean
  className?: string
  onOpen?: () => void
  inModal?: boolean
}

export interface DropdownHandlers {
  handleButtonClick: (event?: React.MouseEvent | React.TouchEvent) => void
  handleSelect: (option: DropdownOption) => void
  handleTouchStart: (e: React.TouchEvent) => void
  handleTouchEnd: (e: React.TouchEvent, option: DropdownOption) => void
}