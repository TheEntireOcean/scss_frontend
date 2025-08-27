// src/components/overlays/PoseOverlay.jsx
import React, { useEffect } from 'react'

const POSE_CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4], // Head
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // Arms
  [5, 11], [6, 12], [11, 12], // Torso
  [11, 13], [13, 15], [12, 14], [14, 16] // Legs
]

const PoseOverlay = ({ poses, canvasRef, videoRef }) => {
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !poses?.length) {
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    const scaleX = canvas.width / (video.videoWidth || canvas.width)
    const scaleY = canvas.height / (video.videoHeight || canvas.height)

    poses.forEach((pose) => {
      const { keypoints, confidence } = pose
      
      if (keypoints && confidence > 0.5) {
        // Draw pose connections
        ctx.strokeStyle = '#F59E0B' // orange-500
        ctx.lineWidth = 2
        
        POSE_CONNECTIONS.forEach(([start, end]) => {
          const startPoint = keypoints[start]
          const endPoint = keypoints[end]
          
          if (startPoint?.confidence > 0.5 && endPoint?.confidence > 0.5) {
            ctx.beginPath()
            ctx.moveTo(startPoint.x * scaleX, startPoint.y * scaleY)
            ctx.lineTo(endPoint.x * scaleX, endPoint.y * scaleY)
            ctx.stroke()
          }
        })

        // Draw keypoints
        ctx.fillStyle = '#F59E0B'
        keypoints.forEach((point) => {
          if (point?.confidence > 0.5) {
            ctx.beginPath()
            ctx.arc(point.x * scaleX, point.y * scaleY, 4, 0, 2 * Math.PI)
            ctx.fill()
          }
        })
      }
    })
  }, [poses, canvasRef, videoRef])

  return null
}

export default PoseOverlay