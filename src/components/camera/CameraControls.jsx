// src/components/camera/CameraControls.jsx
import React, { useState } from 'react'
import { CogIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { cameraService } from '../../services/api/cameras'
import { useNotifications } from '../../contexts/NotificationContext'
import LoadingSpinner from '../common/LoadingSpinner'

const CameraControls = ({ camera, onCameraUpdate }) => {
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    resolution_width: camera.resolution?.width || 1920,
    resolution_height: camera.resolution?.height || 1080,
    fps: camera.fps || 30,
    brightness: camera.settings?.brightness || 50,
    contrast: camera.settings?.contrast || 50,
    saturation: camera.settings?.saturation || 50
  })
  
  const { success, error } = useNotifications()

  const handleSettingsUpdate = async () => {
    try {
      setLoading(true)
      const response = await cameraService.updateCameraSettings(camera.id, settings)
      onCameraUpdate(response.data.camera)
      success('Camera settings updated successfully')
      setShowSettings(false)
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Camera Controls
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <CogIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Camera Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <div className="flex items-center gap-2 mt-1">
            <div className={`h-2 w-2 rounded-full ${
              camera.isActive ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-sm text-gray-900 dark:text-white">
              {camera.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Resolution
          </label>
          <p className="text-sm text-gray-900 dark:text-white mt-1">
            {camera.resolution?.width}x{camera.resolution?.height}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Frame Rate
          </label>
          <p className="text-sm text-gray-900 dark:text-white mt-1">
            {camera.fps} fps
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type
          </label>
          <p className="text-sm text-gray-900 dark:text-white mt-1 capitalize">
            {camera.camera_type || camera.type}
          </p>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Camera Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Resolution Width
              </label>
              <input
                type="number"
                value={settings.resolution_width}
                onChange={(e) => handleSettingChange('resolution_width', parseInt(e.target.value))}
                className="form-input mt-1"
                min="640"
                max="3840"
                step="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Resolution Height
              </label>
              <input
                type="number"
                value={settings.resolution_height}
                onChange={(e) => handleSettingChange('resolution_height', parseInt(e.target.value))}
                className="form-input mt-1"
                min="480"
                max="2160"
                step="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Frame Rate (fps)
              </label>
              <select
                value={settings.fps}
                onChange={(e) => handleSettingChange('fps', parseInt(e.target.value))}
                className="form-select mt-1"
              >
                <option value={15}>15 fps</option>
                <option value={20}>20 fps</option>
                <option value={25}>25 fps</option>
                <option value={30}>30 fps</option>
                <option value={60}>60 fps</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Brightness
              </label>
              <input
                type="range"
                value={settings.brightness}
                onChange={(e) => handleSettingChange('brightness', parseInt(e.target.value))}
                className="w-full mt-1"
                min="0"
                max="100"
              />
              <span className="text-xs text-gray-500">{settings.brightness}%</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contrast
              </label>
              <input
                type="range"
                value={settings.contrast}
                onChange={(e) => handleSettingChange('contrast', parseInt(e.target.value))}
                className="w-full mt-1"
                min="0"
                max="100"
              />
              <span className="text-xs text-gray-500">{settings.contrast}%</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Saturation
              </label>
              <input
                type="range"
                value={settings.saturation}
                onChange={(e) => handleSettingChange('saturation', parseInt(e.target.value))}
                className="w-full mt-1"
                min="0"
                max="100"
              />
              <span className="text-xs text-gray-500">{settings.saturation}%</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSettingsUpdate}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading && <LoadingSpinner size="small" color="white" />}
              Apply Settings
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CameraControls