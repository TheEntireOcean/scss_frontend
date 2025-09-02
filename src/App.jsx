// src/App.jsx - Enhanced version
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import SingleCameraView from './pages/SingleCameraView'
import CameraManagement from './pages/CameraManagement'
import PersonManagement from './pages/PersonManagement'
import SystemSettings from './pages/SystemSettings'
import LoadingSpinner from './components/common/LoadingSpinner'
// Development only
const TestPage = React.lazy(() => import('./pages/TestPage'))
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-white">Initializing system...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <LoginPage /> : <Navigate to="/" replace />} 
          />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/cameras/:id" element={<SingleCameraView />} />
                    <Route path="/cameras" element={<CameraManagement />} />
                    <Route path="/persons" element={<PersonManagement />} />
                    <Route path="/settings" element={<SystemSettings />} />
                    {/* Development test page */}
                    {process.env.NODE_ENV === 'development' && (
                      <Route path="/test" element={
                        <React.Suspense fallback={<LoadingSpinner size="large" />}>
                          <TestPage />
                        </React.Suspense>
                      } />
                    )}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ErrorBoundary>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App