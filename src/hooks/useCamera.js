// src/hooks/useCamera.js
import { useState, useEffect } from 'react';
import { cameraService } from '../services/api/cameras';
import { useNotifications } from '../contexts/NotificationContext';

export const useCamera = (cameraId) => {
  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error: notifyError } = useNotifications();

  useEffect(() => {
    const loadCamera = async () => {
      try {
        setLoading(true);
        const response = await cameraService.getCamera(cameraId);
        setCamera(response.data.camera);
      } catch (err) {
        notifyError('Failed to load camera details');
      } finally {
        setLoading(false);
      }
    };
    if (cameraId) loadCamera();
  }, [cameraId]);

  const startCamera = async () => {
    try {
      await cameraService.startCamera(cameraId);
      setCamera(prev => ({ ...prev, isActive: true }));
    } catch (err) {
      notifyError('Failed to start camera');
    }
  };

  const stopCamera = async () => {
    try {
      await cameraService.stopCamera(cameraId);
      setCamera(prev => ({ ...prev, isActive: false }));
    } catch (err) {
      notifyError('Failed to stop camera');
    }
  };

  return { camera, loading, startCamera, stopCamera };
};