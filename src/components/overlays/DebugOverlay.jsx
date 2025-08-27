// src/components/overlays/DebugOverlay.jsx
import React, { useEffect } from 'react'

const DebugOverlay = ({ debug, canvasRef, videoRef }) => {
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !debug) {
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Draw debug information
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(10, 10, 200, 120)

    ctx.fillStyle = '#EF4444' // red-500
    ctx.font = '12px monospace'
    
    const debugInfo = [
      `FPS: ${debug.fps || 0}`,
      `Detections: ${debug.detection_count || 0}`,
      `Recognitions: ${debug.recognition_count || 0}`,
      `Tracks: ${debug.track_count || 0}`,
      `Processing Time: