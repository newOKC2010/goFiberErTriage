import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'pastel';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode | string;
  fullWidth?: boolean;
  customWidth?: string | number;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  fullWidth = false,
  customWidth,
  ...props
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';

  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    warning: 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300',
    pastel: 'bg-blue-200 hover:bg-blue-300 text-gray-700 focus:ring-blue-300 hover:shadow-xl'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    icon: 'p-2 w-10 h-10'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const widthStyle = customWidth 
    ? { width: typeof customWidth === 'number' ? `${customWidth}px` : customWidth } 
    : {};

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      style={widthStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
          <span className="text-sm">กำลังดำเนินการ...</span>
        </div>
      ) : (
        <>
          {icon && (
            typeof icon === 'string' ? (
              <span 
                className="material-symbols-outlined text-lg sm:text-xl"
                style={{
                  fontVariationSettings: "'wght' 700",
                  transition: 'all 0.3s ease'
                }}
              >
                {icon}
              </span>
            ) : (
              <span>{icon}</span>
            )
          )}
          {children}
        </>
      )}
    </button>
  );
};