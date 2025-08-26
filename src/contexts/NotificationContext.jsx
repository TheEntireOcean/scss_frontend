// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useReducer } from 'react'

const NotificationContext = createContext()

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return [...state, { ...action.payload, id: Date.now() }]
    case 'REMOVE_NOTIFICATION':
      return state.filter(notification => notification.id !== action.payload)
    case 'CLEAR_ALL':
      return []
    default:
      return state
  }
}

export const NotificationProvider = ({ children }) => {
  const [notifications, dispatch] = useReducer(notificationReducer, [])

  const addNotification = (notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        type: 'info',
        duration: 4000,
        ...notification
      }
    })
  }

  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' })
  }

  // Helper methods for different notification types
  const success = (message, options = {}) => {
    addNotification({ type: 'success', message, ...options })
  }

  const error = (message, options = {}) => {
    addNotification({ type: 'error', message, duration: 6000, ...options })
  }

  const warning = (message, options = {}) => {
    addNotification({ type: 'warning', message, ...options })
  }

  const info = (message, options = {}) => {
    addNotification({ type: 'info', message, ...options })
  }

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}