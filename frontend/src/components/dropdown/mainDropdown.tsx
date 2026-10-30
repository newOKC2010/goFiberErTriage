'use client';

import { useState } from 'react';
import DropdownButton from '@/components/dropdown/component/dropdownButton';
import DropdownMenu from '@/components/dropdown/component/dropdownMenu';
import { DropdownOption } from '@/components/dropdown/handler/TYPE';
import {
  useMobileDetection,
  useOutsideClick,
  useFilteredOptions,
  useSelectedOption
} from '@/components/dropdown/handler/dropdownLogic';
import {
  createDropdownHandlers,
  getDropdownClasses,
  getDropdownMenuStyle
} from '@/components/dropdown/handler/dropdownHandler';

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  onOpen?: () => void;
  inModal?: boolean;
  label?: string;
  icon?: string;
  required?: boolean;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = '-- เลือก --',
  searchable = false,
  className = '',
  onOpen,
  inModal = false,
  label,
  icon,
  required = false
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [touchStartY, setTouchStartY] = useState(0);

  const isMobile = useMobileDetection();
  const selectedOption = useSelectedOption(options, value);
  const filteredOptions = useFilteredOptions(options, searchTerm);

  const dropdownRef = useOutsideClick(
    isOpen,
    isMobile,
    inModal,
    () => setIsOpen(false)
  );

  const handlers = createDropdownHandlers(
    isOpen,
    isMobile,
    touchStartY,
    setIsOpen,
    setSearchTerm,
    setTouchStartY,
    onChange,
    onOpen
  );

  return (
    <div className={className}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 transition-colors">
          {icon && (
            <span className="material-symbols-outlined text-blue-600 text-lg transition-transform hover:scale-110">
              {icon}
            </span>
          )}
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      <div
        ref={dropdownRef}
        className={getDropdownClasses('')}
        style={getDropdownMenuStyle(isOpen)}
      >
        <DropdownButton
          selectedOption={selectedOption}
          placeholder={placeholder}
          isOpen={isOpen}
          onClick={handlers.handleButtonClick}
          onTouchEnd={handlers.handleButtonClick}
        />

        <DropdownMenu
          isOpen={isOpen}
          searchable={searchable}
          isMobile={isMobile}
          searchTerm={searchTerm}
          filteredOptions={filteredOptions}
          selectedValue={value}
          className={className}
          onSearchChange={setSearchTerm}
          onSelect={handlers.handleSelect}
          onTouchStart={handlers.handleTouchStart}
          onTouchEnd={handlers.handleTouchEnd}
        />
      </div>
    </div>
  );
}
