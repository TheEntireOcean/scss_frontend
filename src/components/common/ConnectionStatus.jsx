// src/components/common/ConnectionStatus.jsx
import React, { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import apiClient from '../../services/api/client'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline'

const ConnectionStatus = () => {
  const { connected: socketConnected } = useSocket()
  const [apiStatus, setApiStatus] = useState({ healthy: false, checking: true })
  const [lastCheck, setLastCheck] = useState(null)

  const checkAPIHealth = async () => {
    setApiStatus(prev => ({ ...prev, checking: true }))
    
    const health = await apiClient.healthCheck()
    setApiStatus({ 
      healthy: health.healthy, 
      checking: false,
      error: health.error 
    })
    setLastCheck(new Date())
  }

  useEffect(() => {
    // Initial health check
    checkAPIHealth()
    
    // Check API health every 30 seconds
    const interval = setInterval(checkAPIHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (isHealthy) => {
    if (isHealthy) return CheckCircleIcon
    return XCircleIcon
  }

  const getStatusColor = (isHealthy) => {
    if (isHealthy) return 'text-green-600 dark:text-green-400'
    return 'text-red-600 dark:text-red-400'
  }

  const APIIcon = getStatusIcon(apiStatus.healthy)
  const SocketIcon = getStatusIcon(socketConnected)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Connection Status
        </h3>
        <button
          onClick={checkAPIHealth}
          disabled={apiStatus.checking}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${apiStatus.checking ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {/* API Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <APIIcon className={`h-4 w-4 ${getStatusColor(apiStatus.healthy)}`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Backend API
            </span>
          </div>
          <span className={`text-xs ${getStatusColor(apiStatus.healthy)}`}>
            {apiStatus.checking ? 'Checking...' : apiStatus.healthy ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Socket Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SocketIcon className={`h-4 w-4 ${getStatusColor(socketConnected)}`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Real-time Updates
            </span>
          </div>
          <span className={`text-xs ${getStatusColor(socketConnected)}`}>
            {socketConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Error Display */}
        {!apiStatus.healthy && apiStatus.error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400">
            {apiStatus.error}
          </div>
        )}

        {/* Last Check Time */}
        {lastCheck && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectionStatus