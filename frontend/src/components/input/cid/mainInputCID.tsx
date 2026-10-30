'use client';

import React, { useState, useRef } from 'react';

interface CidInputProps {
  value: string;
  onChange: (value: string) => void;
  pattern?: number[];
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const CidInput: React.FC<CidInputProps> = ({
  value,
  onChange,
  pattern = [1,4,5,2,1],
  size = 'md',
  disabled = false,
}) => {
  const totalDigits = pattern.reduce((sum, count) => sum + count, 0);
  const [digits, setDigits] = useState(Array(totalDigits).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(totalDigits).fill(null));

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 sm:w-8 sm:h-8 text-xs sm:text-lg',
    lg: 'w-6 h-6 sm:w-10 sm:h-10 text-sm sm:text-xl'
  };

  React.useEffect(() => {
    const cleanValue = value.replace(/[^0-9]/g, '').padEnd(totalDigits, '');
    setDigits(cleanValue.split('').slice(0, totalDigits));
  }, [value, totalDigits]);

  const updateValue = (newDigits: string[]) => {
    setDigits(newDigits);
    onChange(newDigits.join('').replace(/\s+$/, ''));
  };

  const focusNext = (index: number) => {
    if (index < totalDigits - 1) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 10);
    }
  };

  const focusPrev = (index: number) => {
    if (index > 0) {
      requestAnimationFrame(() => inputRefs.current[index - 1]?.focus());
    }
  };

  const handleInputChange = (index: number, inputValue: string) => {
    const singleDigit = inputValue.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    updateValue(newDigits);
    
    if (singleDigit) focusNext(index);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (/^[0-9]$/.test(e.key)) {
      focusNext(index);
      return;
    }
    
    const newDigits = [...digits];
    
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index] !== '') {
        newDigits[index] = '';
        updateValue(newDigits);
      } else if (index > 0) {
        newDigits[index - 1] = '';
        updateValue(newDigits);
        focusPrev(index);
      }
    }
    
    if (e.key === 'Delete') {
      e.preventDefault();
      newDigits[index] = '';
      updateValue(newDigits);
    }
    
    if (e.key === 'ArrowLeft') { e.preventDefault(); focusPrev(index); }
    if (e.key === 'ArrowRight') { e.preventDefault(); focusNext(index); }
    if (e.key === 'Home') { e.preventDefault(); inputRefs.current[0]?.focus(); }
    if (e.key === 'End') { e.preventDefault(); inputRefs.current[totalDigits - 1]?.focus(); }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const cleanPasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, totalDigits);
    onChange(cleanPasted);
    
    setTimeout(() => {
      const lastIndex = Math.min(cleanPasted.length - 1, totalDigits - 1);
      if (lastIndex >= 0) inputRefs.current[lastIndex]?.focus();
    }, 0);
  };

  const handleFocus = (index: number) => {
    requestAnimationFrame(() => inputRefs.current[index]?.select());
  };

  const renderInput = (index: number) => (
    <input
      key={index}
      ref={(el) => { if (inputRefs.current) inputRefs.current[index] = el; }}
      type="tel"
      inputMode="numeric"
      pattern="[0-9]"
      value={digits[index] || ''}
      onChange={(e) => handleInputChange(index, e.target.value)}
      onKeyDown={(e) => handleKeyDown(index, e)}
      onFocus={() => handleFocus(index)}
      onClick={() => handleFocus(index)}
      onPaste={handlePaste}
      className={`${sizeClasses[size]} text-center font-bold text-black border border-black rounded focus:outline-none focus:border-blue-500 bg-white hover:border-blue-400 transition-all duration-200 flex-shrink-0`}
      style={{ color: '#000000', WebkitTextFillColor: '#000000' }}
      maxLength={1}
      disabled={disabled}
      autoComplete="off"
    />
  );

  const renderByPattern = () => {
    let currentIndex = 0;
    const elements: React.JSX.Element[] = [];
    
    pattern.forEach((count, groupIndex) => {
      for (let i = 0; i < count; i++) {
        elements.push(renderInput(currentIndex + i));
      }
      currentIndex += count;
      
      if (groupIndex < pattern.length - 1) {
        elements.push(
          <span key={`dash-${groupIndex}`} className="font-bold text-xs sm:text-lg mx-0.5">-</span>
        );
      }
    });
    
    return elements;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-0.5 sm:gap-1 flex-wrap">
        {renderByPattern()}
      </div>
    </div>
  );
};

export default CidInput;