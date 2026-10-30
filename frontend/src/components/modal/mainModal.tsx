'use client';

import { ReactNode, useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  showCloseButton?: boolean;
  contentClassName?: string;
  wrapperClassName?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  icon,
  showCloseButton = true,
  contentClassName = '',
  wrapperClassName = 'max-w-md'
}: ModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else {
      if (shouldRender) {
        setIsClosing(true);
        setTimeout(() => {
          setShouldRender(false);
          setIsClosing(false);
        }, 200);
      }
    }
  }, [isOpen, shouldRender]);

  const handleClose = () => {
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto z-50">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className={`w-full ${wrapperClassName} my-4 ${
          isClosing ? 'animate-slide-down' : 'animate-slide-up'
        }`}>
          <div className={`bg-white rounded-2xl shadow-2xl p-6 sm:p-8 relative ${contentClassName}`}>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 hover:cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'wght' 700", transition: 'all 0.3s ease' }}
                >
                  cancel
                </span>
              </button>
            )}

            <div className="text-center mb-6">
              {icon && (
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {icon}
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {title}
              </h2>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
