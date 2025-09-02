// src/components/system/SystemControls.jsx
import React from 'react';
import { cameraService } from '../../services/api/cameras';
import { systemService } from '../../services/api/system';
import { useNotifications } from '../../contexts/NotificationContext';

const SystemControls = () => {
  const { success, error } = useNotifications();

  const handleStartAll = async () => {
    try {
      // Assume backend supports batch; else loop over getCameras
      await cameraService.post('/cameras/start-all'); // Add this endpoint if needed
      success('All cameras started');
    } catch (err) {
      error('Failed to start all cameras');
    }
  };

  const handleStopAll = async () => {
    try {
      await cameraService.post('/cameras/stop-all');
      success('All cameras stopped');
    } catch (err) {
      error('Failed to stop all cameras');
    }
  };

  const handleResetConfig = async () => {
    if (window.confirm('Reset system config?')) {
      try {
        await systemService.post('/system/reset-config'); // Add if needed
        success('System config reset');
      } catch (err) {
        error('Failed to reset config');
      }
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleStartAll} className="bg-green-600 text-white px-4 py-2 rounded">Start All</button>
      <button onClick={handleStopAll} className="bg-red-600 text-white px-4 py-2 rounded">Stop All</button>
      <button onClick={handleResetConfig} className="bg-orange-600 text-white px-4 py-2 rounded">Reset Config</button>
    </div>
  );
};

export default SystemControls;