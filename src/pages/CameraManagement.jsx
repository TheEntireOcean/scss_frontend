// src/pages/CameraManagement.jsx
import React, { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { cameraService } from '../services/api/cameras'
import { useNotifications } from '../contexts/NotificationContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const CameraManagement = () => {
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { success, error } = useNotifications()

  useEffect(() => {
    loadCameras()
  }, [])

  const loadCameras = async () => {
    try {
      setLoading(true)
      const response = await cameraService.getCameras()
      setCameras(response.data.cameras || [])
    } catch (err) {
      error('Failed to load cameras')
    } finally {
      setLoading(false)
    }
  }

  const handleStartCamera = async (cameraId) => {
    try {
      await cameraService.startCamera(cameraId)
      success('Camera started successfully')
      loadCameras()
    } catch (err) {
      error('Failed to start camera')
    }
  }

  const handleStopCamera = async (cameraId) => {
    try {
      await cameraService.stopCamera(cameraId)
      success('Camera stopped successfully')
      loadCameras()
    } catch (err) {
      error('Failed to stop camera')
    }
  }

  const filteredCameras = cameras.filter(camera =>
    camera.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Camera Management</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage and configure your cameras
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Add Camera</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search cameras..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
        />
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCameras.map((camera) => (
          <div key={camera.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400">
                Camera Preview Coming Soon
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {camera.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  camera.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {camera.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {camera.source}
              </p>
              <div className="flex space-x-2">
                {camera.isActive ? (
                  <button
                    onClick={() => handleStopCamera(camera.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartCamera(camera.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                  >
                    Start
                  </button>
                )}
                <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm">
                  Configure
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCameras.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            No cameras found. Click "Add Camera" to get started.
          </div>
        </div>
      )}
    </div>
  )
}

export default CameraManagement