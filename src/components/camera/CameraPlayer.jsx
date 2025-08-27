// src/components/camera/CameraPlayer.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { streamManager } from '../../services/streaming/stream-manager'
import OverlayControls from './OverlayControls'
import DetectionOverlay from '../overlays/DetectionOverlay'
import RecognitionOverlay from '../overlays/RecognitionOverlay'
import TrackingOverlay from '../overlays/TrackingOverlay'
import { PlayIcon, StopIcon, CogIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../common/LoadingSpinner'
import clsx from 'clsx'

const CameraPlayer = ({ camera, onCameraUpdate }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [overlaySettings, setOverlaySettings] = useState({
    detection: true,
    recognition: true,
    tracking: false,
    pose: false,
    debug: false
  })
  const [detections, setDetections] = useState([])
  const [recognitions, setRecognitions] = useState([])
  const [tracks, setTracks] = useState([])

  const { on, off, joinCameraRoom, leaveCameraRoom } = useSocket()

  useEffect(() => {
    if (camera?.id) {
      joinCameraRoom(camera.id)

      const handleDetectionUpdate = (data) => {
        if (data.camera_id === camera.id) {
          setDetections(data.detections || [])
        }
      }

      const handleRecognitionUpdate = (data) => {
        if (data.camera_id === camera.id) {
          setRecognitions(data.recognitions || [])
        }
      }

      const handleTrackingUpdate = (data) => {
        if (data.camera_id === camera.id) {
          setTracks(data.tracks || [])
        }
      }

      on('detection_update', handleDetectionUpdate)
      on('recognition_update', handleRecognitionUpdate)
      on('tracking_update', handleTrackingUpdate)

      return () => {
        off('detection_update', handleDetectionUpdate)
        off('recognition_update', handleRecognitionUpdate)
        off('tracking_update', handleTrackingUpdate)
        leaveCameraRoom(camera.id)
      }
    }
  }, [camera?.id])

  const startStream = async () => {
    if (!camera) return

    try {
      setLoading(true)
      setError(null)
      
      const stream = await streamManager.startStream(camera.id, videoRef.current)
      if (stream) {
        setIsPlaying(true)
        onCameraUpdate({ ...camera, isActive: true })
      }
    } catch (err) {
      setError('Failed to start stream')
      console.error('Stream start error:', err)
    } finally {
      setLoading(false)
    }
  }

  const stopStream = async () => {
    if (!camera) return

    try {
      setLoading(true)
      await streamManager.stopStream(camera.id)
      setIsPlaying(false)
      onCameraUpdate({ ...camera, isActive: false })
    } catch (err) {
      setError('Failed to stop stream')
      console.error('Stream stop error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayToggle = (overlayType) => {
    setOverlaySettings(prev => ({
      ...prev,
      [overlayType]: !prev[overlayType]
    }))
  }

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Container */}
      <div className="relative camera-preview">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        
        {/* Overlay Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Overlays */}
        {overlaySettings.detection && (
          <DetectionOverlay
            detections={detections}
            canvasRef={canvasRef}
            videoRef={videoRef}
          />
        )}
        
        {overlaySettings.recognition && (
          <RecognitionOverlay
            recognitions={recognitions}
            canvasRef={canvasRef}
            videoRef={videoRef}
          />
        )}
        
        {overlaySettings.tracking && (
          <TrackingOverlay
            tracks={tracks}
            canvasRef={canvasRef}
            videoRef={videoRef}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <LoadingSpinner size="large" color="white" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="mb-4">{error}</p>
              <button onClick={startStream} className="btn-primary">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Placeholder when not streaming */}
        {!isPlaying && !loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <PlayIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-4">Camera Ready</p>
              <button onClick={startStream} className="btn-primary">
                Start Stream
              </button>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={isPlaying ? stopStream : startStream}
              disabled={loading}
              className={clsx(
                'p-2 rounded-full transition-all duration-200',
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              )}
            >
              {isPlaying ? (
                <StopIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
            </button>
            
            <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
              {camera.name}
            </div>
          </div>

          <OverlayControls
            settings={overlaySettings}
            onToggle={handleOverlayToggle}
          />
        </div>
      </div>
    </div>
  )
}

export default CameraPlayer