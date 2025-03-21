import React from 'react';
import { type Peer } from '../types';

interface VideoGridProps {
  peers: Peer[];
  localStream: MediaStream | null;
}

const VideoGrid: React.FC<VideoGridProps> = ({ peers, localStream }) => {
  const gridCols = peers.length <= 1 ? 1 : peers.length <= 4 ? 2 : 3;

  return (
    <div 
      className={`grid gap-4 w-full h-full`}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      }}
    >
      {localStream && (
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <video
            className="w-full h-full object-cover mirror"
            autoPlay
            playsInline
            muted
            ref={(video) => {
              if (video) video.srcObject = localStream;
            }}
          />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
            You
          </div>
        </div>
      )}
      
      {peers.map((peer) => (
        <div key={peer.id} className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <video
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            ref={(video) => {
              if (video) video.srcObject = peer.stream;
            }}
          />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
            Peer {peer.id.slice(0, 4)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;