// src/components/system/PerformanceOverview.jsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { systemService } from '../../services/api/system';

const PerformanceOverview = () => {
  const { on, off } = useSocket();
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, fpsAvg: 0 });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await systemService.getPerformanceMetrics();
        setMetrics(response.data);
      } catch (err) {
        console.error('Failed to fetch metrics');
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Poll every 5s

    const handleMetrics = (data) => setMetrics(data);
    on('PERFORMANCE_METRICS', handleMetrics);

    return () => {
      clearInterval(interval);
      off('PERFORMANCE_METRICS', handleMetrics);
    };
  }, [on, off]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>CPU: {metrics.cpu}%</div>
      <div>Memory: {metrics.memory}%</div>
      <div>Avg FPS: {metrics.fpsAvg}</div>
      {/* Add charts with Chart.js if installed */}
    </div>
  );
};

export default PerformanceOverview;