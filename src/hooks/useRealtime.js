// src/hooks/useRealtime.js
import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

export const useRealtime = (cameraId) => {
  const { socket, joinCameraRoom, leaveCameraRoom, on, off } = useSocket();
  const [detections, setDetections] = useState([]);
  const [recognitions, setRecognitions] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    if (socket && cameraId) {
      joinCameraRoom(cameraId);

      const handleDetectionUpdate = (data) => {
        if (data.camera_id === cameraId) setDetections(data.detections || []);
      };
      const handleRecognitionUpdate = (data) => {
        if (data.camera_id === cameraId) setRecognitions(data.recognitions || []);
      };
      const handleTrackingUpdate = (data) => {
        if (data.camera_id === cameraId) setTracks(data.tracks || []);
      };
      const handleCameraMetricsUpdate = (data) => {
        if (data.camera_id === cameraId) setMetrics(data.metrics || {});
      };

      on('DETECTION_UPDATE', handleDetectionUpdate);
      on('RECOGNITION_UPDATE', handleRecognitionUpdate);
      on('TRACKING_UPDATE', handleTrackingUpdate);
      on('CAMERA_METRICS_UPDATE', handleCameraMetricsUpdate);

      return () => {
        off('DETECTION_UPDATE', handleDetectionUpdate);
        off('RECOGNITION_UPDATE', handleRecognitionUpdate);
        off('TRACKING_UPDATE', handleTrackingUpdate);
        off('CAMERA_METRICS_UPDATE', handleCameraMetricsUpdate);
        leaveCameraRoom(cameraId);
      };
    }
  }, [socket, cameraId, on, off, joinCameraRoom, leaveCameraRoom]);

  return { detections, recognitions, tracks, metrics };
};