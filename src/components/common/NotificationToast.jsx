// src/components/common/NotificationToast.jsx
import React, { useEffect } from 'react'
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { useNotifications } from '../../contexts/NotificationContext'
import clsx from 'clsx'

const iconMap = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon
}

const colorMap = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200'
}

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

const ToastItem = ({ notification, onRemove }) => {
  const Icon = iconMap[notification.type]

  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(onRemove, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.duration, onRemove])

  return (
    <div className={clsx(
      'min-w-80 max-w-md p-4 border rounded-lg shadow-lg animate-in slide-in-from-right duration-300',
      colorMap[notification.type]
    )}>
      <div className="flex items-start">
        <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {notification.title && (
            <h4 className="font-semibold mb-1">{notification.title}</h4>
          )}
          <p className="text-sm">{notification.message}</p>
        </div>
        <button
          onClick={onRemove}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default NotificationToast