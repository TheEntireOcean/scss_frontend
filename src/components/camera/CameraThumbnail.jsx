// src/components/camera/CameraThumbnail.jsx
import React, { useState, useEffect } from 'react'
import { PlayIcon, StopIcon, SignalIcon, SignalSlashIcon } from '@heroicons/react/24/outline'
import { useSocket } from '../../contexts/SocketContext'
import clsx from 'clsx'

const CameraThumbnail = ({ camera, onCameraUpdate }) => {
  const [detectionCount, setDetectionCount] = useState(0)
  const { on, off, joinCameraRoom, leaveCameraRoom } = useSocket()

  useEffect(() => {
    if (camera?.id) {
      joinCameraRoom(camera.id)

      const handleDetectionUpdate = (data) => {
        if (data.camera_id === camera.id) {
          setDetectionCount(data.detections?.length || 0)
        }
      }

      const handleCameraStatusChanged = (data) => {
        if (data.camera_id === camera.id) {
          onCameraUpdate({ ...camera, ...data.status })
        }
      }

      on('detection_update', handleDetectionUpdate)
      on('camera_status_changed', handleCameraStatusChanged)

      return () => {
        off('detection_update', handleDetectionUpdate)
        off('camera_status_changed', handleCameraStatusChanged)
        leaveCameraRoom(camera.id)
      }
    }
  }, [camera?.id])

  return (
    <div className="p-3">
      <div className="camera-preview mb-2">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          {camera.isActive ? (
            <div className="text-center">
              <SignalIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-xs text-white">Streaming</div>
            </div>
          ) : (
            <div className="text-center">
              <SignalSlashIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-xs text-gray-400">Offline</div>
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="absolute top-2 left-2 flex gap-1">
          <div className={clsx(
            'px-2 py-1 text-xs rounded font-medium',
            camera.isActive 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-500 text-white'
          )}>
            {camera.isActive ? 'Live' : 'Off'}
          </div>
          {detectionCount > 0 && (
            <div className="px-2 py-1 text-xs rounded font-medium bg-blue-500 text-white">
              {detectionCount}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
          {camera.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {camera.resolution?.width}x{camera.resolution?.height} • {camera.fps}fps
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {camera.source}
        </p>
      </div>
    </div>
  )
}

export default CameraThumbnail