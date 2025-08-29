// src/components/system/PerformanceMetrics.jsx
import React, { useState, useEffect } from 'react'
import { systemService } from '../../services/api/system'
import { useSocket } from '../../contexts/SocketContext'

const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    cpuUsage: [],
    memoryUsage: [],
    gpuUsage: [],
    networkIO: [],
    diskIO: [],
    detectionFPS: [],
    recognitionLatency: []
  })
  const [realTimeData, setRealTimeData] = useState(null)
  const { on, off, connected } = useSocket()

  useEffect(() => {
    loadHistoricalMetrics()
    
    if (connected) {
      on('performance_metrics', handleMetricsUpdate)
      return () => off('performance_metrics', handleMetricsUpdate)
    }
  }, [connected])

  const loadHistoricalMetrics = async () => {
    try {
      const response = await systemService.getPerformanceMetrics()
      if (response.data.metrics) {
        setMetrics(response.data.metrics)
      }
    } catch (error) {
      console.warn('Failed to load performance metrics:', error)
    }
  }

  const handleMetricsUpdate = (data) => {
    setRealTimeData(data)
    
    // Update historical data (keep last 50 points)
    setMetrics(prev => {
      const newMetrics = { ...prev }
      const timestamp = Date.now()
      
      if (data.cpuUsage !== undefined) {
        newMetrics.cpuUsage = [...prev.cpuUsage.slice(-49), { timestamp, value: data.cpuUsage }]
      }
      if (data.memoryUsage !== undefined) {
        newMetrics.memoryUsage = [...prev.memoryUsage.slice(-49), { timestamp, value: data.memoryUsage }]
      }
      if (data.gpuUsage !== undefined) {
        newMetrics.gpuUsage = [...prev.gpuUsage.slice(-49), { timestamp, value: data.gpuUsage }]
      }
      
      return newMetrics
    })
  }

  const getStatusColor = (value, thresholds = { good: 60, warning: 80 }) => {
    if (value < thresholds.good) return 'text-green-600 dark:text-green-400'
    if (value < thresholds.warning) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const renderMiniChart = (data, color = '#3B82F6') => {
    if (!data || data.length === 0) return null
    
    const max = Math.max(...data.map(d => d.value))
    const min = Math.min(...data.map(d => d.value))
    const range = max - min || 1
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((point.value - min) / range) * 100
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        Performance Metrics
      </h2>

      {/* Real-time Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={realTimeData?.cpuUsage || 0}
          unit="%"
          color={getStatusColor(realTimeData?.cpuUsage || 0)}
          chart={renderMiniChart(metrics.cpuUsage, '#EF4444')}
        />
        <MetricCard
          title="Memory Usage"
          value={realTimeData?.memoryUsage || 0}
          unit="%"
          color={getStatusColor(realTimeData?.memoryUsage || 0)}
          chart={renderMiniChart(metrics.memoryUsage, '#F59E0B')}
        />
        <MetricCard
          title="GPU Usage"
          value={realTimeData?.gpuUsage || 'N/A'}
          unit={realTimeData?.gpuUsage ? '%' : ''}
          color={realTimeData?.gpuUsage ? getStatusColor(realTimeData.gpuUsage) : 'text-gray-500'}
          chart={renderMiniChart(metrics.gpuUsage, '#10B981')}
        />
        <MetricCard
          title="Detection FPS"
          value={realTimeData?.detectionFPS || 0}
          unit="fps"
          color="text-blue-600 dark:text-blue-400"
          chart={renderMiniChart(metrics.detectionFPS, '#3B82F6')}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Resources */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              System Resources
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">CPU Cores</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {realTimeData?.cpuCores || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Memory</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatBytes(realTimeData?.totalMemory || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Available Memory</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatBytes(realTimeData?.availableMemory || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">GPU Model</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {realTimeData?.gpuModel || 'Not Available'}
              </span>
            </div>
          </div>
        </div>

        {/* Processing Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Processing Performance
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Detection FPS</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {realTimeData?.detectionFPS?.toFixed(1) || '0.0'} fps
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Recognition Latency</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {realTimeData?.recognitionLatency?.toFixed(0) || '0'} ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Streams</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {realTimeData?.activeStreams || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Processed Frames/min</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {realTimeData?.framesPerMinute || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Network and Storage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Network & Storage
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatBytes(realTimeData?.networkIn || 0)}/s
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Network In</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatBytes(realTimeData?.networkOut || 0)}/s
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Network Out</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatBytes(realTimeData?.diskRead || 0)}/s
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Disk Read</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatBytes(realTimeData?.diskWrite || 0)}/s
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Disk Write</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        {connected ? (
          <span className="text-green-600 dark:text-green-400">
            ● Real-time updates active
          </span>
        ) : (
          <span className="text-red-600 dark:text-red-400">
            ● Real-time updates disconnected
          </span>
        )}
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, unit, color, chart }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h4>
      <div className={`text-lg font-semibold ${color}`}>
        {value}{unit}
      </div>
    </div>
    {chart && (
      <div className="mt-2">
        {chart}
      </div>
    )}
  </div>
)

export default PerformanceMetrics