// Dropdown trigger button component
import { DropdownOption } from '@/components/dropdown/handler/TYPE'
import { getMobileTouchStyles } from '@/components/dropdown/handler/dropdownHandler'

interface DropdownButtonProps {
  selectedOption: DropdownOption | undefined
  placeholder: string
  isOpen: boolean
  onClick: (event?: React.MouseEvent | React.TouchEvent) => void
  onTouchEnd: (event?: React.MouseEvent | React.TouchEvent) => void
}

export default function DropdownButton({
  selectedOption,
  placeholder,
  isOpen,
  onClick,
  onTouchEnd
}: DropdownButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onTouchEnd={onTouchEnd}
      className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm 
                 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 active:bg-blue-200 transition-all duration-200 font-bold text-gray-900 cursor-pointer
                 touch-manipulation select-none"
      style={getMobileTouchStyles()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedOption?.color && (
            <span className={`w-3 h-3 rounded-full ${selectedOption.color}`}></span>
          )}
          <span className={`font-bold ${selectedOption ? "text-gray-900" : "text-gray-500"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  )
}