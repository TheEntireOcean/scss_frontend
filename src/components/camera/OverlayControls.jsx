// src/components/camera/OverlayControls.jsx
import React, { useState } from 'react'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  MapIcon, 
  CogIcon,
  BugAntIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const overlayTypes = [
  { key: 'detection', label: 'Detection', icon: EyeIcon, color: 'bg-blue-500' },
  { key: 'recognition', label: 'Recognition', icon: UserIcon, color: 'bg-green-500' },
  { key: 'tracking', label: 'Tracking', icon: MapIcon, color: 'bg-purple-500' },
  { key: 'pose', label: 'Pose', icon: UserIcon, color: 'bg-orange-500' },
  { key: 'debug', label: 'Debug', icon: BugAntIcon, color: 'bg-red-500' }
]

const OverlayControls = ({ settings, onToggle }) => {
  const [showControls, setShowControls] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowControls(!showControls)}
        className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200"
      >
        <CogIcon className="h-5 w-5" />
      </button>

      {showControls && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowControls(false)}
          />
          
          <div className="absolute bottom-full right-0 mb-2 z-20 bg-gray-800 rounded-lg p-3 min-w-48">
            <h4 className="text-white font-medium mb-2 text-sm">Overlays</h4>
            
            <div className="space-y-2">
              {overlayTypes.map((overlay) => {
                const Icon = overlay.icon
                const isEnabled = settings[overlay.key]
                
                return (
                  <button
                    key={overlay.key}
                    onClick={() => onToggle(overlay.key)}
                    className={clsx(
                      'flex items-center gap-2 w-full px-2 py-1 rounded text-sm transition-all duration-200',
                      isEnabled
                        ? 'bg-white/20 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <div className={clsx(
                      'h-3 w-3 rounded-full',
                      isEnabled ? overlay.color : 'bg-gray-600'
                    )} />
                    <Icon className="h-4 w-4" />
                    <span>{overlay.label}</span>
                    {isEnabled ? (
                      <EyeIcon className="h-4 w-4 ml-auto" />
                    ) : (
                      <EyeSlashIcon className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default OverlayControls