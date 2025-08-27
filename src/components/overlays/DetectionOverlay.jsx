// src/components/overlays/DetectionOverlay.jsx
import React, { useEffect } from 'react'

const DetectionOverlay = ({ detections, canvasRef, videoRef }) => {
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !detections?.length) {
      // Clear canvas if no detections
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.offsetWidth
    canvas.height = video.videoHeight || video.offsetHeight

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw detection boxes
    detections.forEach((detection, index) => {
      const { bbox, confidence, class_name } = detection
      
      if (bbox) {
        const { x, y, width, height } = bbox
        
        // Scale coordinates to canvas size
        const scaleX = canvas.width / (video.videoWidth || canvas.width)
        const scaleY = canvas.height / (video.videoHeight || canvas.height)
        
        const scaledX = x * scaleX
        const scaledY = y * scaleY
        const scaledWidth = width * scaleX
        const scaledHeight = height * scaleY

        // Set box style
        ctx.strokeStyle = '#3B82F6' // blue-500
        ctx.lineWidth = 2
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)' // blue with opacity

        // Draw bounding box
        ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight)
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight)

        // Draw label
        const label = `${class_name || 'Person'} ${Math.round(confidence * 100)}%`
        ctx.fillStyle = '#3B82F6'
        ctx.font = '12px Arial'
        
        const textMetrics = ctx.measureText(label)
        const textHeight = 16
        
        // Draw label background
        ctx.fillRect(
          scaledX, 
          scaledY - textHeight - 2, 
          textMetrics.width + 8, 
          textHeight + 4
        )
        
        // Draw label text
        ctx.fillStyle = 'white'
        ctx.fillText(label, scaledX + 4, scaledY - 4)
      }
    })
  }, [detections, canvasRef, videoRef])

  return null // This component only draws on canvas
}

export default DetectionOverlay