// src/pages/TestPage.jsx - For development testing
import React, { useState } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import { cameraService } from '../services/api/cameras'
import { personService } from '../services/api/persons'
import { systemService } from '../services/api/system'
import apiClient from '../services/api/client'
import ConnectionStatus from '../components/common/ConnectionStatus'
import LoadingSpinner from '../components/common/LoadingSpinner'

const TestPage = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})
  const { user } = useAuth()
  const { connected, socket } = useSocket()

  const runTest = async (testName, testFunction) => {
    setLoading(prev => ({ ...prev, [testName]: true }))
    try {
      const result = await testFunction()
      setResults(prev => ({ 
        ...prev, 
        [testName]: { success: true, data: result, timestamp: new Date() }
      }))
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: error.response?.data || error.message, 
          timestamp: new Date() 
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }))
    }
  }

  const tests = [
    {
      name: 'API Health Check',
      key: 'health',
      test: () => apiClient.healthCheck()
    },
    {
      name: 'Get Cameras',
      key: 'cameras',
      test: () => cameraService.getCameras()
    },
    {
      name: 'Get Persons',
      key: 'persons',
      test: () => personService.getPersons()
    },
    {
      name: 'Get System Status',
      key: 'system',
      test: () => systemService.getSystemStatus()
    },
    {
      name: 'Get System Config',
      key: 'config',
      test: () => systemService.getSystemConfig()
    },
    {
      name: 'Socket.IO Test',
      key: 'socket',
      test: () => new Promise((resolve) => {
        if (connected && socket) {
          socket.emit('test_connection', { message: 'Hello from frontend' })
          resolve({ connected: true, socketId: socket.id })
        } else {
          resolve({ connected: false, error: 'Socket not connected' })
        }
      })
    }
  ]

  const clearResults = () => {
    setResults({})
  }

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.key, test.test)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            API Testing Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Test backend connectivity and API endpoints
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={clearResults}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Clear Results
          </button>
          <button
            onClick={runAllTests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Run All Tests
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ConnectionStatus />
          
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              User Info
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Username: {user?.username || 'Not logged in'}</p>
              <p>Role: {user?.role || 'N/A'}</p>
              <p>Token: {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</p>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Test Results
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tests.map((test) => (
                  <TestCard
                    key={test.key}
                    test={test}
                    result={results[test.key]}
                    loading={loading[test.key]}
                    onRun={() => runTest(test.key, test.test)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Results */}
      {Object.keys(results).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Raw Results (Development)
            </h3>
          </div>
          <div className="p-6">
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

const TestCard = ({ test, result, loading, onRun }) => {
  const getStatusColor = () => {
    if (!result) return 'border-gray-200 dark:border-gray-700'
    return result.success 
      ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
      : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
  }

  const getStatusIcon = () => {
    if (loading) return '⏳'
    if (!result) return '⚪'
    return result.success ? '✅' : '❌'
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {getStatusIcon()} {test.name}
        </h4>
        <button
          onClick={onRun}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 flex items-center space-x-1"
        >
          {loading && <LoadingSpinner size="small" />}
          <span>Test</span>
        </button>
      </div>
      
      {result && (
        <div className="text-sm">
          <p className={`font-medium ${
            result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {result.success ? 'Success' : 'Failed'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {result.timestamp.toLocaleTimeString()}
          </p>
          
          {!result.success && result.error && (
            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs">
              {typeof result.error === 'object' 
                ? JSON.stringify(result.error, null, 2)
                : result.error
              }
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TestPage