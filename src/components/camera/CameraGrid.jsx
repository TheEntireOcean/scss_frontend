// src/components/camera/CameraGrid.jsx
import React from 'react'
import CameraThumbnail from './CameraThumbnail'
import clsx from 'clsx'

const CameraGrid = ({ cameras, selectedCamera, onCameraSelect, onCameraUpdate }) => {
  if (cameras.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No cameras configured</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
      {cameras.map((camera) => (
        <div
          key={camera.id}
          className={clsx(
            'cursor-pointer rounded-lg border-2 transition-all duration-200',
            selectedCamera?.id === camera.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          )}
          onClick={() => onCameraSelect(camera)}
        >
          <CameraThumbnail 
            camera={camera} 
            onCameraUpdate={onCameraUpdate}
          />
        </div>
      ))}
    </div>
  )
}

export default CameraGrid