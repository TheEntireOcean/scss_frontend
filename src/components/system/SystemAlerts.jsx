// src/components/system/SystemAlerts.jsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';

const SystemAlerts = () => {
  const { on, off } = useSocket();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const handleAlert = (alert) => {
      setAlerts(prev => [...prev, alert].slice(-5)); // Keep last 5
    };
    on('SYSTEM_ALERT', handleAlert);
    return () => off('SYSTEM_ALERT', handleAlert);
  }, [on, off]);

  return (
    <div className="bg-red-100 p-4 rounded">
      <h4>System Alerts</h4>
      <ul>
        {alerts.map((alert, idx) => <li key={idx}>{alert.message}</li>)}
      </ul>
      {alerts.length === 0 && <p>No alerts</p>}
    </div>
  );
};

export default SystemAlerts;