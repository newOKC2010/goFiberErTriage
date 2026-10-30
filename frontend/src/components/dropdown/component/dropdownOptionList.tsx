// Options list component สำหรับ dropdown
import { DropdownOption } from '@/components/dropdown/handler/TYPE'
import { getMobileTouchStyles } from '@/components/dropdown/handler/dropdownHandler'

interface OptionsListProps {
  filteredOptions: DropdownOption[]
  selectedValue?: string
  isMobile: boolean
  onSelect: (option: DropdownOption) => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent, option: DropdownOption) => void
}

export default function OptionsList({
  filteredOptions,
  selectedValue,
  onSelect,
  onTouchStart,
  onTouchEnd
}: OptionsListProps) {
  return (
    <div className="max-h-60 overflow-y-auto touch-manipulation" style={{ touchAction: 'manipulation' }}>
      {filteredOptions.length > 0 ? (
        filteredOptions.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option)}
            onTouchStart={onTouchStart}
            onTouchEnd={(e) => onTouchEnd(e, option)}
            className={`w-full px-4 py-3 text-left hover:bg-blue-100 focus:bg-blue-100 active:bg-blue-200
                       focus:outline-none transition-colors duration-150 font-bold cursor-pointer
                       touch-manipulation select-none
                       ${selectedValue === option.value ? 'bg-blue-200 text-blue-900' : 'text-gray-900'}
                       ${index === filteredOptions.length - 1 ? '' : 'border-b border-gray-100'}`}
            style={getMobileTouchStyles()}
          >
            <div className="flex items-center gap-2 break-words leading-relaxed">
              {option.color && (
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${option.color}`}></span>
              )}
              <span>{option.label}</span>
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-8 text-center text-gray-500 font-bold">
          ไม่พบข้อมูลที่ค้นหา
        </div>
      )}
    </div>
  )
}