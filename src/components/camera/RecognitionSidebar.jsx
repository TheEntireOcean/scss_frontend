// src/components/camera/RecognitionSidebar.jsx
import React from 'react';

const RecognitionSidebar = ({ recognitions, tracks }) => {
  return (
    <div>
      <h4>Recognition Results</h4>
      {recognitions.map((rec, idx) => (
        <div key={idx} className="border p-2 mb-2">
          <p>Track ID: {tracks.find(t => t.id === rec.trackId)?.id || 'N/A'}</p>
          <p>Name: {rec.name}</p>
          <p>Confidence: {rec.confidence}%</p>
          <p>Pose: {rec.pose}</p>
          <p>Face Size: {rec.faceSize}px</p>
        </div>
      ))}
      {recognitions.length === 0 && <p>No recognitions</p>}
    </div>
  );
};

export default RecognitionSidebar;