// src/components/overlays/TrackingOverlay.jsx
import React, { useEffect, useState } from 'react'

const TrackingOverlay = ({ tracks, canvasRef, videoRef }) => {
  const [trackHistory, setTrackHistory] = useState(new Map())

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !tracks?.length) {
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    // Update track history
    tracks.forEach((track) => {
      const { track_id, bbox } = track
      if (track_id && bbox) {
        const centerX = bbox.x + bbox.width / 2
        const centerY = bbox.y + bbox.height / 2
        
        setTrackHistory(prev => {
          const newHistory = new Map(prev)
          const currentTrack = newHistory.get(track_id) || []
          
          // Add new point and limit history length
          const updatedTrack = [...currentTrack, { x: centerX, y: centerY, timestamp: Date.now() }]
          if (updatedTrack.length > 20) {
            updatedTrack.shift()
          }
          
          newHistory.set(track_id, updatedTrack)
          return newHistory
        })
      }
    })

    // Draw tracking trails
    const scaleX = canvas.width / (video.videoWidth || canvas.width)
    const scaleY = canvas.height / (video.videoHeight || canvas.height)

    trackHistory.forEach((history, trackId) => {
      if (history.length > 1) {
        ctx.strokeStyle = '#8B5CF6' // purple-500
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.7

        ctx.beginPath()
        history.forEach((point, index) => {
          const scaledX = point.x * scaleX
          const scaledY = point.y * scaleY
          
          if (index === 0) {
            ctx.moveTo(scaledX, scaledY)
          } else {
            ctx.lineTo(scaledX, scaledY)
          }
        })
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })

    // Draw current track boxes
    tracks.forEach((track) => {
      const { track_id, bbox, person_id } = track
      
      if (bbox) {
        const { x, y, width, height } = bbox
        
        const scaledX = x * scaleX
        const scaledY = y * scaleY
        const scaledWidth = width * scaleX
        const scaledHeight = height * scaleY

        // Draw track box
        ctx.strokeStyle = '#8B5CF6' // purple-500
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight)
        ctx.setLineDash([])

        // Draw track ID
        const label = `Track ${track_id}${person_id ? ` (${person_id})` : ''}`
        ctx.fillStyle = '#8B5CF6'
        ctx.font = '12px Arial'
        
        const textMetrics = ctx.measureText(label)
        const textHeight = 16
        
        ctx.fillRect(
          scaledX + scaledWidth - textMetrics.width - 8, 
          scaledY - textHeight - 2, 
          textMetrics.width + 8, 
          textHeight + 4
        )
        
        ctx.fillStyle = 'white'
        ctx.fillText(label, scaledX + scaledWidth - textMetrics.width - 4, scaledY - 4)
      }
    })

  }, [tracks, trackHistory, canvasRef, videoRef])

  // Cleanup old tracks
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now()
      setTrackHistory(prev => {
        const newHistory = new Map()
        prev.forEach((history, trackId) => {
          const recentHistory = history.filter(point => now - point.timestamp < 30000) // 30 seconds
          if (recentHistory.length > 0) {
            newHistory.set(trackId, recentHistory)
          }
        })
        return newHistory
      })
    }, 5000)

    return () => clearInterval(cleanup)
  }, [])

  return null
}

export default TrackingOverlay