import React from 'react';

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'full' | number | string;
    icon?: string;
}

export const InputText = ({
    label,
    error,
    maxWidth = 'sm',
    icon,
    className = '',
    ...props
}: InputTextProps) => {
    const widthClasses: Record<string, string> = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        full: 'max-w-full'
    };

    const getMaxWidth = () => {
        if (typeof maxWidth === 'number') return `${maxWidth}px`;
        if (typeof maxWidth === 'string' && !widthClasses[maxWidth]) return maxWidth;
        return undefined;
    };

    const customWidth = getMaxWidth();

    return (
        <div 
            className={`w-full ${!customWidth ? widthClasses[maxWidth as string] : ''} mx-auto`}
            style={customWidth ? { maxWidth: customWidth } : undefined}
        >
            {label && <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>}

            <div className="relative hover:scale-105 transition-all duration-300">
                {icon && (
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl"
                        style={{
                            fontVariationSettings: "'wght' 700",
                            transition: 'all 0.3s ease'
                        }}>
                        {icon}
                    </span>
                )}

                <input
                    className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 text-center font-bold text-black bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 placeholder:text-gray-600 ${error ? 'border-red-400' : ''} ${className}`}
                    {...props}
                />
            </div>

            {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}
        </div>
    );
};
