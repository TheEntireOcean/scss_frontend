// src/components/camera/CameraDashboard.jsx
import React, { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { cameraService } from '../../services/api/cameras'
import CameraGrid from './CameraGrid'
import CameraPlayer from './CameraPlayer'
import CameraControls from './CameraControls'
import LoadingSpinner from '../common/LoadingSpinner'
import { useNotifications } from '../../contexts/NotificationContext'

const CameraDashboard = () => {
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { connected } = useSocket()
  const { error: notifyError } = useNotifications()

  useEffect(() => {
    loadCameras()
  }, [])

  const loadCameras = async () => {
    try {
      setLoading(true)
      const response = await cameraService.getCameras()
      setCameras(response.data.cameras || [])
      if (response.data.cameras?.length > 0 && !selectedCamera) {
        setSelectedCamera(response.data.cameras[0])
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to load cameras'
      setError(errorMsg)
      notifyError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleCameraSelect = (camera) => {
    setSelectedCamera(camera)
  }

  const handleCameraUpdate = (updatedCamera) => {
    setCameras(prev => 
      prev.map(cam => cam.id === updatedCamera.id ? updatedCamera : cam)
    )
    if (selectedCamera?.id === updatedCamera.id) {
      setSelectedCamera(updatedCamera)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={loadCameras}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full">
      {/* Main Camera View */}
      <div className="xl:col-span-3 space-y-4">
        {selectedCamera ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedCamera.name}
              </h2>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  selectedCamera.isActive ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCamera.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <CameraPlayer 
              camera={selectedCamera} 
              onCameraUpdate={handleCameraUpdate}
            />
            
            <CameraControls 
              camera={selectedCamera}
              onCameraUpdate={handleCameraUpdate}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Camera Selected
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Select a camera from the grid to view its stream
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Camera Grid */}
      <div className="xl:col-span-1">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Cameras ({cameras.length})
          </h3>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              connected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
        
        <CameraGrid
          cameras={cameras}
          selectedCamera={selectedCamera}
          onCameraSelect={handleCameraSelect}
          onCameraUpdate={handleCameraUpdate}
        />
      </div>
    </div>
  )
}

export default CameraDashboard