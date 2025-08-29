// src/services/streaming/stream-manager.js
class StreamManager {
  constructor() {
    this.streams = new Map()
    this.fallbackOrder = ['webrtc', 'rtsp-webrtc', 'websocket']
  }

  async startStream(cameraId, videoElement) {
    try {
      // Try WebRTC first
      const webrtcStream = await this.startWebRTCStream(cameraId)
      if (webrtcStream) {
        videoElement.srcObject = webrtcStream
        this.streams.set(cameraId, { type: 'webrtc', stream: webrtcStream })
        return webrtcStream
      }
    } catch (error) {
      console.warn('WebRTC failed, trying RTSP conversion:', error)
    }

    try {
      // Fallback to RTSP-WebRTC conversion
      const rtspStream = await this.startRTSPWebRTCStream(cameraId)
      if (rtspStream) {
        videoElement.srcObject = rtspStream
        this.streams.set(cameraId, { type: 'rtsp-webrtc', stream: rtspStream })
        return rtspStream
      }
    } catch (error) {
      console.warn('RTSP-WebRTC failed, trying WebSocket:', error)
    }

    // Final fallback to WebSocket streaming
    return this.startWebSocketStream(cameraId, videoElement)
  }

  async startWebRTCStream(cameraId) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    return new Promise(async (resolve, reject) => {
      pc.ontrack = (event) => {
        resolve(event.streams[0])
      }

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          reject(new Error('WebRTC connection failed'))
        }
      }

      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        const response = await fetch(`/api/cameras/${cameraId}/webrtc-offer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer: offer.sdp })
        })

        const { answer } = await response.json()
        await pc.setRemoteDescription({ type: 'answer', sdp: answer })
      } catch (error) {
        reject(error)
      }
    })
  }

  async startRTSPWebRTCStream(cameraId) {
    // Similar WebRTC setup but with server-side RTSP conversion
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    return new Promise(async (resolve, reject) => {
      pc.ontrack = (event) => resolve(event.streams[0])

      try {
        const response = await fetch(`/api/cameras/${cameraId}/rtsp-stream`, {
          method: 'POST'
        })
        const { streamUrl } = await response.json()
        
        // Server handles RTSP to WebRTC conversion
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        const answerResponse = await fetch(streamUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer: offer.sdp })
        })

        const { answer } = await answerResponse.json()
        await pc.setRemoteDescription({ type: 'answer', sdp: answer })
      } catch (error) {
        reject(error)
      }
    })
  }

  async startWebSocketStream(cameraId, videoElement) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    const ws = new WebSocket(`ws://${window.location.host}/api/cameras/${cameraId}/stream`)
    
    ws.onmessage = (event) => {
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        // Convert canvas to video stream
        const stream = canvas.captureStream(30)
        videoElement.srcObject = stream
      }
      img.src = `data:image/jpeg;base64,${event.data}`
    }

    this.streams.set(cameraId, { type: 'websocket', ws })
    return new Promise(resolve => {
      ws.onopen = () => resolve(canvas.captureStream(30))
    })
  }

  async stopStream(cameraId) {
    const streamInfo = this.streams.get(cameraId)
    if (!streamInfo) return

    switch (streamInfo.type) {
      case 'webrtc':
      case 'rtsp-webrtc':
        streamInfo.stream.getTracks().forEach(track => track.stop())
        break
      case 'websocket':
        streamInfo.ws.close()
        break
    }

    this.streams.delete(cameraId)
    
    // Notify server to stop stream
    fetch(`/api/cameras/${cameraId}/stop-stream`, { method: 'POST' })
      .catch(console.warn)
  }

  getStreamInfo(cameraId) {
    return this.streams.get(cameraId)
  }
}

export const streamManager = new StreamManager()