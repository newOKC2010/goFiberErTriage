'use client';

import { useState, useRef, useEffect } from 'react';

interface ThaiTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  inModal?: boolean;
}

export default function ThaiTimePicker({ 
  value, 
  onChange, 
  label, 
  required = false,
  error,
  inModal = false 
}: ThaiTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHour(h || '00');
      setMinute(m || '00');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleHourChange = (h: string) => {
    setHour(h);
    onChange(`${h}:${minute}`);
  };

  const handleMinuteChange = (m: string) => {
    setMinute(m);
    onChange(`${hour}:${m}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border ${error ? 'border-red-400' : 'border-gray-300'} rounded-lg font-bold text-sm text-black bg-white focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:border-gray-400 transition-colors`}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-500 text-lg">schedule</span>
          <span>{value || 'เลือกเวลา'}</span>
        </div>
        <span className="material-symbols-outlined text-gray-400">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {error && <p className="text-red-500 text-xs font-bold mt-1">{error}</p>}

      {isOpen && (
        <div className={`absolute z-[9999] mt-1 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-xl ${inModal ? 'min-w-[200px]' : 'min-w-[300px]'}`}>
          <div className={inModal ? 'p-3' : 'p-6'}>
            <div className={`flex items-center justify-center ${inModal ? 'gap-3' : 'gap-6'}`}>
              <div className="flex-1">
                <label className={`block font-bold text-gray-700 text-center ${inModal ? 'text-xs mb-1' : 'text-sm mb-3'}`}>
                  ชั่วโมง
                </label>
                <div className={`overflow-y-auto border-2 border-gray-200 rounded-xl ${inModal ? 'max-h-36' : 'max-h-64'}`}>
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleHourChange(h)}
                      className={`w-full font-bold text-center hover:bg-blue-50 transition-colors ${inModal ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} ${
                        hour === h ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`font-bold text-gray-400 ${inModal ? 'text-xl mt-5' : 'text-3xl mt-8'}`}>:</div>

              <div className="flex-1">
                <label className={`block font-bold text-gray-700 text-center ${inModal ? 'text-xs mb-1' : 'text-sm mb-3'}`}>
                  นาที
                </label>
                <div className={`overflow-y-auto border-2 border-gray-200 rounded-xl ${inModal ? 'max-h-36' : 'max-h-64'}`}>
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMinuteChange(m)}
                      className={`w-full font-bold text-center hover:bg-blue-50 transition-colors ${inModal ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} ${
                        minute === m ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={`flex justify-end gap-2 ${inModal ? 'mt-3' : 'mt-6'}`}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`font-bold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ${inModal ? 'px-3 py-1.5 text-xs' : 'px-6 py-2.5 text-sm'}`}
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(`${hour}:${minute}`);
                  setIsOpen(false);
                }}
                className={`font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors ${inModal ? 'px-3 py-1.5 text-xs' : 'px-6 py-2.5 text-sm'}`}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
