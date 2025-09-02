// src/components/camera/CameraGrid.jsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import CameraThumbnail from './CameraThumbnail';
import clsx from 'clsx';

const CameraGrid = ({ cameras, selectedCamera, onCameraSelect, onCameraUpdate }) => {
  if (cameras.length === 0) return <div>No cameras</div>;

  const Row = ({ index, style }) => {
    const camera = cameras[index];
    return (
      <div style={style} onClick={() => onCameraSelect(camera)}>
        <div className={clsx(/* existing clsx */)}>
          <CameraThumbnail camera={camera} onCameraUpdate={onCameraUpdate} />
        </div>
      </div>
    );
  };

  return (
    <List
      height={400} // Adjust as needed
      itemCount={cameras.length}
      itemSize={150} // Thumbnail height
      width="100%"
    >
      {Row}
    </List>
  );
};

export default CameraGrid;