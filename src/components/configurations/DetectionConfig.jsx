// src/components/configuration/DetectionConfig.jsx
import React, { useState, useEffect } from 'react'
import { systemService } from '../../services/api/system'
import { useNotifications } from '../../contexts/NotificationContext'
import LoadingSpinner from '../common/LoadingSpinner'

const DetectionConfig = () => {
  const [config, setConfig] = useState({
    detectionThreshold: 0.5,
    recognitionConfidence: 0.8,
    samplingRate: 30,
    maxConcurrentStreams: 10,
    enableFaceDetection: true,
    enableFaceRecognition: true,
    enableObjectDetection: false,
    enablePoseEstimation: false,
    enableAgeGender: false,
    enableEmotionDetection: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { success, error } = useNotifications()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await systemService.getSystemConfig()
      if (response.data.config) {
        setConfig(prev => ({ ...prev, ...response.data.config }))
      }
    } catch (err) {
      error('Failed to load detection configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await systemService.updateSystemConfig(config)
      success('Detection configuration updated successfully')
    } catch (err) {
      error('Failed to update configuration')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    setConfig({
      detectionThreshold: 0.5,
      recognitionConfidence: 0.8,
      samplingRate: 30,
      maxConcurrentStreams: 10,
      enableFaceDetection: true,
      enableFaceRecognition: true,
      enableObjectDetection: false,
      enablePoseEstimation: false,
      enableAgeGender: false,
      enableEmotionDetection: false
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Detection Configuration
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetToDefaults}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2"
          >
            {saving && <LoadingSpinner size="small" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Core Detection Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Core Detection Settings
          </h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Detection Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detection Threshold: {config.detectionThreshold.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={config.detectionThreshold}
              onChange={(e) => handleConfigChange('detectionThreshold', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Low (0.1)</span>
              <span>High (1.0)</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Lower values detect more faces but may include false positives
            </p>
          </div>

          {/* Recognition Confidence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recognition Confidence: {config.recognitionConfidence.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={config.recognitionConfidence}
              onChange={(e) => handleConfigChange('recognitionConfidence', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Low (0.1)</span>
              <span>High (1.0)</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Higher values require more confidence for person identification
            </p>
          </div>

          {/* Sampling Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sampling Rate: {config.samplingRate} fps
            </label>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={config.samplingRate}
              onChange={(e) => handleConfigChange('samplingRate', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 fps</span>
              <span>60 fps</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Frames per second to process for detection (higher = more CPU usage)
            </p>
          </div>

          {/* Max Concurrent Streams */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Concurrent Streams: {config.maxConcurrentStreams}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={config.maxConcurrentStreams}
              onChange={(e) => handleConfigChange('maxConcurrentStreams', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>50</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Maximum number of camera streams to process simultaneously
            </p>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Detection Features
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToggleOption
              title="Face Detection"
              description="Detect faces in video streams"
              enabled={config.enableFaceDetection}
              onChange={(value) => handleConfigChange('enableFaceDetection', value)}
              required
            />
            <ToggleOption
              title="Face Recognition"
              description="Identify known persons"
              enabled={config.enableFaceRecognition}
              onChange={(value) => handleConfigChange('enableFaceRecognition', value)}
              disabled={!config.enableFaceDetection}
            />
            <ToggleOption
              title="Object Detection"
              description="Detect objects in scenes"
              enabled={config.enableObjectDetection}
              onChange={(value) => handleConfigChange('enableObjectDetection', value)}
            />
            <ToggleOption
              title="Pose Estimation"
              description="Detect human poses and keypoints"
              enabled={config.enablePoseEstimation}
              onChange={(value) => handleConfigChange('enablePoseEstimation', value)}
            />
            <ToggleOption
              title="Age & Gender"
              description="Estimate age and gender"
              enabled={config.enableAgeGender}
              onChange={(value) => handleConfigChange('enableAgeGender', value)}
              disabled={!config.enableFaceDetection}
            />
            <ToggleOption
              title="Emotion Detection"
              description="Detect facial emotions"
              enabled={config.enableEmotionDetection}
              onChange={(value) => handleConfigChange('enableEmotionDetection', value)}
              disabled={!config.enableFaceDetection}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const ToggleOption = ({ title, description, enabled, onChange, disabled = false, required = false }) => (
  <div className={`p-4 border rounded-lg ${
    disabled 
      ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
      : 'border-gray-200 dark:border-gray-600'
  }`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className={`font-medium ${
          disabled 
            ? 'text-gray-400 dark:text-gray-500' 
            : 'text-gray-900 dark:text-white'
        }`}>
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        <p className={`text-sm mt-1 ${
          disabled 
            ? 'text-gray-400 dark:text-gray-500' 
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {description}
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled || required}
          className="sr-only peer"
        />
        <div className={`w-11 h-6 rounded-full peer ${
          disabled 
            ? 'bg-gray-300 dark:bg-gray-600' 
            : 'bg-gray-200 dark:bg-gray-700'
        } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
          enabled && !disabled 
            ? 'peer-checked:bg-blue-600' 
            : disabled 
              ? 'peer-checked:bg-gray-400' 
              : ''
        }`} />
      </label>
    </div>
  </div>
)

export default DetectionConfig