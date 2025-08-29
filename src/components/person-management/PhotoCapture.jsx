// src/components/person-management/PhotoCapture.jsx
import React, { useState, useRef, useCallback } from 'react'
import { CameraIcon, XMarkIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const PhotoCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImages, setCapturedImages] = useState([])
  const [error, setError] = useState(null)
  const [currentStream, setCurrentStream] = useState(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCurrentStream(stream)
        setIsStreaming(true)
        setError(null)
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.')
      console.error('Camera access error:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop())
      setCurrentStream(null)
    }
    setIsStreaming(false)
  }, [currentStream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob)
        const newImage = {
          id: Date.now(),
          blob,
          url: imageUrl,
          timestamp: new Date()
        }
        setCapturedImages(prev => [...prev, newImage])
      }
    }, 'image/jpeg', 0.9)
  }, [])

  const removeImage = (imageId) => {
    setCapturedImages(prev => {
      const updated = prev.filter(img => img.id !== imageId)
      // Clean up object URL
      const removed = prev.find(img => img.id === imageId)
      if (removed) {
        URL.revokeObjectURL(removed.url)
      }
      return updated
    })
  }

  const handleFinish = () => {
    if (capturedImages.length === 0) {
      setError('Please capture at least one photo')
      return
    }

    const imageFiles = capturedImages.map(img => {
      return new File([img.blob], `photo_${img.id}.jpg`, { type: 'image/jpeg' })
    })

    onCapture(imageFiles)
    stopCamera()
  }

  const handleClose = () => {
    stopCamera()
    // Clean up object URLs
    capturedImages.forEach(img => URL.revokeObjectURL(img.url))
    onClose()
  }

  React.useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
      // Clean up object URLs
      capturedImages.forEach(img => URL.revokeObjectURL(img.url))
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Capture Photos
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Feed */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Camera Feed
              </h3>
              
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {error ? (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <CameraIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>{error}</p>
                      <button
                        onClick={startCamera}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Camera controls overlay */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <button
                        onClick={capturePhoto}
                        disabled={!isStreaming}
                        className="bg-white hover:bg-gray-100 text-gray-900 p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CameraIcon className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        isStreaming ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <span className="text-white text-sm">
                        {isStreaming ? 'Live' : 'Offline'}
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Capture multiple angles for better recognition accuracy
                </p>
              </div>
            </div>

            {/* Captured Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Captured Photos ({capturedImages.length})
                </h3>
                {capturedImages.length > 0 && (
                  <button
                    onClick={() => setCapturedImages([])}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-64 max-h-96 overflow-y-auto">
                {capturedImages.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>No photos captured yet</p>
                      <p className="text-sm">Use the camera to capture photos</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {capturedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={`Captured ${image.id}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {image.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Recommended: 3-5 photos from different angles
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleFinish}
                disabled={capturedImages.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <CheckIcon className="h-4 w-4" />
                <span>Use Photos ({capturedImages.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoCapture