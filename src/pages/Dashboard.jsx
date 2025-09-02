// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { useNotifications } from '../contexts/NotificationContext'
import { ChartBarIcon, VideoCameraIcon, UserGroupIcon, CpuChipIcon } from '@heroicons/react/24/outline'

import CameraGrid from '../components/camera/CameraGrid';
import SystemControls from '../components/system/SystemControls';
import SystemAlerts from '../components/system/SystemAlerts';
import PerformanceOverview from '../components/system/PerformanceOverview';


const Dashboard = () => {
  const { connected, requestSystemStatus } = useSocket()
  const { info } = useNotifications()
  const [systemStats, setSystemStats] = useState({
    activeCameras: 0,
    totalPersons: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    detectionCount24h: 0,
    recognitionCount24h: 0
  })

  // Request system status once connected
  useEffect(() => {
    if (connected) {
      requestSystemStatus()
    }
  }, [connected, requestSystemStatus])

  // Listen for system_status updates
  useEffect(() => {
    const handleSystemStatus = (data) => setSystemStats(data)
    on('system_status', handleSystemStatus)
    return () => off('system_status', handleSystemStatus)
  }, [on, off])

  const stats = [
    {
      name: 'Active Cameras',
      value: systemStats.activeCameras,
      icon: VideoCameraIcon,
      change: '+2 this week',
      changeType: 'positive'
    },
    {
      name: 'Registered Persons',
      value: systemStats.totalPersons,
      icon: UserGroupIcon,
      change: '+5 this month',
      changeType: 'positive'
    },
    {
      name: 'CPU Usage',
      value: `${systemStats.cpuUsage}%`,
      icon: CpuChipIcon,
      change: 'Normal',
      changeType: 'neutral'
    },
    {
      name: 'Memory Usage',
      value: `${systemStats.memoryUsage}%`,
      icon: ChartBarIcon,
      change: 'Optimal',
      changeType: 'positive'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="dashboard-layout grid grid-cols-4 gap-6">
      <header className="col-span-4"><SystemControls /></header>
      <aside className="col-span-1"><SystemAlerts /></aside>
      <main className="col-span-3"><CameraGrid cameras={cameras} selectedCamera={selectedCamera} onCameraSelect={setSelectedCamera} onCameraUpdate={handleUpdate} /></main>
      <footer className="col-span-4"><PerformanceOverview /></footer>
    </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <span className={`font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 
                  stat.changeType === 'negative' ? 'text-red-600 dark:text-red-400' : 
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <div className="mt-5">
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Activity feed coming soon...
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard