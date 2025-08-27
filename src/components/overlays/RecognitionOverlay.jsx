// src/components/overlays/RecognitionOverlay.jsx
import React, { useEffect } from 'react'

const RecognitionOverlay = ({ recognitions, canvasRef, videoRef }) => {
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !recognitions?.length) {
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    // Draw recognition results
    recognitions.forEach((recognition) => {
      const { bbox, name, confidence } = recognition
      
      if (bbox && name) {
        const { x, y, width, height } = bbox
        
        // Scale coordinates
        const scaleX = canvas.width / (video.videoWidth || canvas.width)
        const scaleY = canvas.height / (video.videoHeight || canvas.height)
        
        const scaledX = x * scaleX
        const scaledY = y * scaleY
        const scaledWidth = width * scaleX
        const scaledHeight = height * scaleY

        // Set recognition box style (green)
        ctx.strokeStyle = '#10B981' // green-500
        ctx.lineWidth = 3
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)'

        // Draw recognition box
        ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight)
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight)

        // Draw name label
        const label = `${name} (${Math.round(confidence * 100)}%)`
        ctx.fillStyle = '#10B981'
        ctx.font = 'bold 14px Arial'
        
        const textMetrics = ctx.measureText(label)
        const textHeight = 18
        
        // Draw name background
        ctx.fillRect(
          scaledX, 
          scaledY + scaledHeight, 
          textMetrics.width + 8, 
          textHeight + 4
        )
        
        // Draw name text
        ctx.fillStyle = 'white'
        ctx.fillText(label, scaledX + 4, scaledY + scaledHeight + textHeight - 2)
      }
    })
  }, [recognitions, canvasRef, videoRef])

  return null
}

export default RecognitionOverlay