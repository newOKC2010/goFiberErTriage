// Dropdown menu container component
import SearchInput from '@/components/dropdown/component/dropdownSearch'
import OptionsList from '@/components/dropdown/component/dropdownOptionList' 
import { DropdownOption } from '@/components/dropdown/handler/TYPE'

interface DropdownMenuProps {
  isOpen: boolean
  searchable: boolean
  isMobile: boolean
  searchTerm: string
  filteredOptions: DropdownOption[]
  selectedValue?: string
  className?: string
  onSearchChange: (term: string) => void
  onSelect: (option: DropdownOption) => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent, option: DropdownOption) => void
}

export default function DropdownMenu({
  isOpen,
  searchable,
  isMobile,
  searchTerm,
  filteredOptions,
  selectedValue,
  className = '',
  onSearchChange,
  onSelect,
  onTouchStart,
  onTouchEnd
}: DropdownMenuProps) {
  if (!isOpen) return null

  const isDropdownUp = className.includes('dropdown-up')

  return (
    <div 
      className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg 
                 animate-in fade-in-0 zoom-in-95 duration-200 touch-manipulation"
      style={{
        top: isDropdownUp ? 'auto' : '100%',
        bottom: isDropdownUp ? '100%' : 'auto',
        marginTop: isDropdownUp ? 0 : 4,
        marginBottom: isDropdownUp ? 4 : 0,
        left: 0,
        width: '100%',
        zIndex: 99999,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Search Input - แสดงเฉพาะใน desktop */}
      {searchable && (
        <SearchInput
          searchTerm={searchTerm}
          onChange={onSearchChange}
          isMobile={isMobile}
        />
      )}

      {/* Options List */}
      <OptionsList
        filteredOptions={filteredOptions}
        selectedValue={selectedValue}
        isMobile={isMobile}
        onSelect={onSelect}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      />
    </div>
  )
}