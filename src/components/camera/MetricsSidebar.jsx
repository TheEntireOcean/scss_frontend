// src/components/camera/MetricsSidebar.jsx
import React from 'react';

const MetricsSidebar = ({ camera, metrics }) => {
  return (
    <div>
      <h4>Camera Metrics</h4>
      <p>FPS: {metrics.fps || camera.fps}</p>
      <p>Resolution: {camera.resolution?.width}x{camera.resolution?.height}</p>
      <p>Latency: {metrics.latency}ms</p>
      <hr />
      <h4>Process Metrics</h4>
      <p>CPU: {metrics.cpu}%</p>
      <p>Memory: {metrics.memory}%</p>
      <p>Detection Rate: {metrics.detectionRate}</p>
    </div>
  );
};

export default MetricsSidebar;