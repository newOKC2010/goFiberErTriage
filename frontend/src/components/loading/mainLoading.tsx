'use client';

import { useEffect, useState } from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  delay?: number; // milliseconds
}

export default function Loading({ 
  message = 'กำลังโหลด...', 
  size = 'md',
  fullScreen = true,
  delay = 3000 
}: LoadingProps) {
  const [showLoading, setShowLoading] = useState(true);
  const [dots, setDots] = useState('');

  // จัดการ delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Animation จุดก้านๆ
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (!showLoading) return null;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            REQ-FORM
          </h1>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Loading Spinner */}
        <div className="relative mb-6">
          <div className={`${sizes[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}></div>
        </div>

        {/* Loading Text */}
        <div className={`${textSizes[size]} text-gray-600 font-bold text-center`}>
          <p>{message}{dots}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full mt-8 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"
               style={{
                 animation: `loading-progress ${delay}ms ease-in-out forwards`
               }}>
          </div>
        </div>

        <style jsx>{`
          @keyframes loading-progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // Inline loading
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizes[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mr-3`}></div>
      <span className={`${textSizes[size]} text-gray-600 font-bold`}>
        {message}{dots}
      </span>
    </div>
  );
}