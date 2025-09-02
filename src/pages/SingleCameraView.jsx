// src/pages/SingleCameraView.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { useRealtime } from '../hooks/useRealtime';
import CameraPlayer from '../components/camera/CameraPlayer';
import RecognitionSidebar from '../components/camera/RecognitionSidebar';
import MetricsSidebar from '../components/camera/MetricsSidebar';
import OverlayControls from '../components/camera/OverlayControls';

const SingleCameraView = () => {
  const { id } = useParams();
  const { camera, startCamera, stopCamera } = useCamera(id);
  const { recognitions, tracks, metrics } = useRealtime(id);

  if (!camera) return <div>Loading...</div>;

  return (
    <div className="single-camera-layout flex h-screen">
      <aside className="left-sidebar w-64 bg-gray-100 p-4">
        <MetricsSidebar camera={camera} metrics={metrics} />
      </aside>
      <main className="flex-1 relative">
        <CameraPlayer streamUrl={camera.streamUrl} overlays={true} />
        <OverlayControls />
      </main>
      <aside className="right-sidebar w-64 bg-gray-100 p-4">
        <RecognitionSidebar recognitions={recognitions} tracks={tracks} />
      </aside>
    </div>
  );
};

export default SingleCameraView;