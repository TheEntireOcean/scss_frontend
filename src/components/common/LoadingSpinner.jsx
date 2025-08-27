// src/components/common/LoadingSpinner.jsx
import React from 'react'
import clsx from 'clsx'

const LoadingSpinner = ({ size = 'medium', className = '', color = 'blue' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6', 
    large: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const colorClasses = {
    blue: 'border-gray-300 border-t-blue-600',
    white: 'border-gray-400 border-t-white',
    gray: 'border-gray-200 border-t-gray-600'
  }

  return (
    <div 
      className={clsx(
        'animate-spin rounded-full border-2',
        sizeClasses[size], 
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner