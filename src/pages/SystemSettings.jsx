import React, { useState, useEffect } from 'react'
import { CogIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { systemService } from '../services/api/system'
import { useNotifications } from '../contexts/NotificationContext'
import { useSocket } from '../contexts/SocketContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const SystemSettings = () => {
  const [config, setConfig] = useState({
    detectionThreshold: 0.5,
    recognitionConfidence: 0.8,
    samplingRate: 30,
    performanceMode: 'balanced',
    maxConcurrentStreams: 10,
    enableLogging: true,
    logLevel: 'info'
  })
  const [systemStatus, setSystemStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { success, error } = useNotifications()
  const { connected, requestSystemStatus } = useSocket()

  useEffect(() => {
    loadSystemConfig()
    loadSystemStatus()
  }, [])

  useEffect(() => {
    if (connected) {
      requestSystemStatus()
    }
  }, [connected, requestSystemStatus])

  const loadSystemConfig = async () => {
    try {
      const response = await systemService.getSystemConfig()
      setConfig(response.data.config || config)
    } catch (err) {
      error('Failed to load system configuration')
    }
  }

  const loadSystemStatus = async () => {
    try {
      const response = await systemService.getSystemStatus()
      setSystemStatus(response.data || {})
    } catch (err) {
      console.warn('Failed to load system status')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveConfig = async () => {
    try {
      setSaving(true)
      await systemService.updateSystemConfig(config)
      success('Configuration updated successfully')
    } catch (err) {
      error('Failed to update configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleResetDatabase = async () => {
    if (!window.confirm('This will delete all persons and embeddings. Are you sure?')) return
    
    try {
      await systemService.resetDatabase()
      success('Database reset successfully')
    } catch (err) {
      error('Failed to reset database')
    }
  }

  const handleRestartService = async (serviceName) => {
    if (!window.confirm(`Restart ${serviceName} service?`)) return
    
    try {
      await systemService.restartService(serviceName)
      success(`${serviceName} service restarted`)
    } catch (err) {
      error(`Failed to restart ${serviceName} service`)
    }
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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">System Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Configure system parameters and manage services
        </p>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">System Status</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemStatus.services?.map((service) => (
              <div key={service.name} className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${
                  service.health === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {service.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {service.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {systemStatus.performance && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemStatus.performance.cpuUsage}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">CPU</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemStatus.performance.memoryUsage}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Memory</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemStatus.performance.gpuUsage || 'N/A'}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">GPU</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemStatus.performance.diskUsage}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Disk</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detection Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Detection Configuration</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detection Threshold: {config.detectionThreshold}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={config.detectionThreshold}
              onChange={(e) => handleConfigChange('detectionThreshold', parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lower values detect more faces but may include false positives
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recognition Confidence: {config.recognitionConfidence}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={config.recognitionConfidence}
              onChange={(e) => handleConfigChange('recognitionConfidence', parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Higher values require more confidence for person identification
            </p>
          </div>
          
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
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Frames per second to process for detection
            </p>
          </div>
        </div>
      </div>

      {/* Performance Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Performance Configuration</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Performance Mode
            </label>
            <select
              value={config.performanceMode}
              onChange={(e) => handleConfigChange('performanceMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="low_power">Low Power</option>
              <option value="balanced">Balanced</option>
              <option value="high_accuracy">High Accuracy</option>
              <option value="maximum_performance">Maximum Performance</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Concurrent Streams: {config.maxConcurrentStreams}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={config.maxConcurrentStreams}
              onChange={(e) => handleConfigChange('maxConcurrentStreams', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">System Actions</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Save Configuration</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Apply current settings</p>
            </div>
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? <LoadingSpinner size="small" /> : <CheckCircleIcon className="h-4 w-4" />}
              <span>Save Settings</span>
            </button>
          </div>
          
          <hr className="border-gray-200 dark:border-gray-700" />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Reset Database</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clear all persons and embeddings</p>
            </div>
            <button
              onClick={handleResetDatabase}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>Reset Database</span>
            </button>
          </div>
          
          <hr className="border-gray-200 dark:border-gray-700" />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Service Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {['gui-service', 'detection-service', 'recognition-service'].map(service => (
                <button
                  key={service}
                  onClick={() => handleRestartService(service)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm flex items-center space-x-2"
                >
                  <CogIcon className="h-4 w-4" />
                  <span>Restart {service}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings