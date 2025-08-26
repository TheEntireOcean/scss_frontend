import React, { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth()
  const socket = useRef(null)

  useEffect(() => {
    if (token && user) {
      // Initialize socket connection with auth
      socket.current = io('/', {
        auth: { token },
        transports: ['websocket', 'polling']
      })

      socket.current.on('connect', () => {
        console.log('Socket connected:', socket.current.id)
      })

      socket.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
      })

      socket.current.on('connection_status', (data) => {
        console.log('Connection status:', data)
      })

      socket.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })

      return () => {
        if (socket.current) {
          socket.current.disconnect()
          socket.current = null
        }
      }
    }
  }, [token, user])

  const joinCameraRoom = (cameraId) => {
    if (socket.current?.connected) {
      socket.current.emit('join_camera_room', { camera_id: cameraId })
    }
  }

  const leaveCameraRoom = (cameraId) => {
    if (socket.current?.connected) {
      socket.current.emit('leave_camera_room', { camera_id: cameraId })
    }
  }

  const requestCameraStatus = (cameraId = null) => {
    if (socket.current?.connected) {
      socket.current.emit('request_camera_status', { camera_id: cameraId })
    }
  }

  const requestSystemStatus = () => {
    if (socket.current?.connected) {
      socket.current.emit('request_system_status')
    }
  }

  const startCameraStream = (cameraId) => {
    if (socket.current?.connected) {
      socket.current.emit('start_camera_stream', { camera_id: cameraId })
    }
  }

  const stopCameraStream = (cameraId) => {
    if (socket.current?.connected) {
      socket.current.emit('stop_camera_stream', { camera_id: cameraId })
    }
  }

  const on = (event, callback) => {
    if (socket.current) {
      socket.current.on(event, callback)
    }
  }

  const off = (event, callback) => {
    if (socket.current) {
      socket.current.off(event, callback)
    }
  }

  const value = {
    socket: socket.current,
    connected: socket.current?.connected || false,
    joinCameraRoom,
    leaveCameraRoom,
    requestCameraStatus,
    requestSystemStatus,
    startCameraStream,
    stopCameraStream,
    on,
    off
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}