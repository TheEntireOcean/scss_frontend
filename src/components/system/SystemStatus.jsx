// src/components/system/SystemStatus.jsx
import React, { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { systemService } from '../../services/api/system'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../common/LoadingSpinner'

const SystemStatus = () => {
  const [systemStatus, setSystemStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const { on, off, requestSystemStatus, connected } = useSocket()

  useEffect(() => {
    loadSystemStatus()
    
    if (connected) {
      // Real-time status updates
      on('system_status_update', handleStatusUpdate)
      on('performance_metrics', handlePerformanceUpdate)
      
      // Request initial status
      requestSystemStatus()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(requestSystemStatus, 30000)
      
      return () => {
        off('system_status_update', handleStatusUpdate)
        off('performance_metrics', handlePerformanceUpdate)
        clearInterval(interval)
      }
    }
  }, [connected])

  const loadSystemStatus = async () => {
    try {
      setLoading(true)
      const response = await systemService.getSystemStatus()
      setSystemStatus(response.data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to load system status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = (data) => {
    setSystemStatus(prev => ({ ...prev, ...data }))
    setLastUpdate(new Date())
  }

  const handlePerformanceUpdate = (data) => {
    setSystemStatus(prev => ({ 
      ...prev, 
      performance: { ...prev.performance, ...data } 
    }))
    setLastUpdate(new Date())
  }

  const getStatusColor = (status, health) => {
    if (health === 'healthy' && status === 'running') return 'text-green-600'
    if (health === 'degraded' || status === 'starting') return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (status, health) => {
    if (health === 'healthy' && status === 'running') return CheckCircleIcon
    if (health === 'degraded' || status === 'starting') return ExclamationTriangleIcon
    return XCircleIcon
  }

  const getPerformanceColor = (value) => {
    if (value < 60) return 'text-green-600'
    if (value < 80) return 'text-yellow-600'
    return 'text-red-600'
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          System Status
        </h2>
        <div className="flex items-center space-x-4">
          {lastUpdate && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadSystemStatus}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Services
          </h3>
        </div>
        <div className="p-6">
          {systemStatus.services?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStatus.services.map((service) => {
                const StatusIcon = getStatusIcon(service.status, service.health)
                const statusColor = getStatusColor(service.status, service.health)
                
                return (
                  <div
                    key={service.name}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </div>
                      <div className={`text-sm capitalize ${statusColor}`}>
                        {service.status} ({service.health})
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No service information available
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      {systemStatus.performance && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Performance Metrics
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <MetricCard
                title="CPU Usage"
                value={systemStatus.performance.cpuUsage}
                unit="%"
                color={getPerformanceColor(systemStatus.performance.cpuUsage)}
              />
              <MetricCard
                title="Memory Usage"
                value={systemStatus.performance.memoryUsage}
                unit="%"
                color={getPerformanceColor(systemStatus.performance.memoryUsage)}
              />
              <MetricCard
                title="GPU Usage"
                value={systemStatus.performance.gpuUsage || 'N/A'}
                unit={systemStatus.performance.gpuUsage ? '%' : ''}
                color={systemStatus.performance.gpuUsage 
                  ? getPerformanceColor(systemStatus.performance.gpuUsage) 
                  : 'text-gray-500'
                }
              />
              <MetricCard
                title="Disk Usage"
                value={systemStatus.performance.diskUsage}
                unit="%"
                color={getPerformanceColor(systemStatus.performance.diskUsage)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Connection Status
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className={`h-3 w-3 rounded-full ${
              connected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                WebSocket Connection
              </div>
              <div className={`text-sm ${
                connected ? 'text-green-600' : 'text-red-600'
              }`}>
                {connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, unit, color }) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${color}`}>
      {value}{unit}
    </div>
    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
      {title}
    </div>
  </div>
)

export default SystemStatus