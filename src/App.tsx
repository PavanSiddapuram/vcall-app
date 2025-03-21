import React, { useEffect, useState, useCallback } from 'react';
import { Peer as PeerJS } from 'peerjs';
import { nanoid } from 'nanoid';
import { toast, Toaster } from 'react-hot-toast';
import { Video, Users, Link as LinkIcon } from 'lucide-react';
import VideoGrid from './components/VideoGrid';
import Controls from './components/Controls';
import type { Peer } from './types';

function App() {
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [peer, setPeer] = useState<PeerJS | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isInCall, setIsInCall] = useState(false);

  // Check URL for room ID on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomIdFromUrl = params.get('room');
    if (roomIdFromUrl) {
      setInputRoomId(roomIdFromUrl);
    }
  }, []);

  const setupLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera and microphone');
    }
  }, []);

  const createRoom = useCallback(async () => {
    if (!localStream) return;
    
    const newRoomId = nanoid(10);
    setRoomId(newRoomId);
    
    const newPeer = new PeerJS();
    setPeer(newPeer);
    
    newPeer.on('open', (id) => {
      setIsInCall(true);
      // Update URL with room ID
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', newRoomId);
      window.history.pushState({}, '', newUrl);
      toast.success('Room created successfully');
    });

    newPeer.on('call', (call) => {
      call.answer(localStream);
      call.on('stream', (remoteStream) => {
        setPeers((currentPeers) => {
          if (currentPeers.find((p) => p.id === call.peer)) return currentPeers;
          return [...currentPeers, { id: call.peer, stream: remoteStream }];
        });
      });
    });
  }, [localStream]);

  const joinRoom = useCallback(async () => {
    if (!localStream || !inputRoomId) return;
    
    const newPeer = new PeerJS();
    setPeer(newPeer);
    setRoomId(inputRoomId);
    
    newPeer.on('open', () => {
      const call = newPeer.call(inputRoomId, localStream);
      call.on('stream', (remoteStream) => {
        setPeers((currentPeers) => {
          if (currentPeers.find((p) => p.id === call.peer)) return currentPeers;
          return [...currentPeers, { id: call.peer, stream: remoteStream }];
        });
      });
      setIsInCall(true);
      // Update URL with room ID
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', inputRoomId);
      window.history.pushState({}, '', newUrl);
      toast.success('Joined room successfully');
    });
  }, [inputRoomId, localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [localStream, isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [localStream, isAudioEnabled]);

  const leaveCall = useCallback(() => {
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setPeers([]);
    setRoomId('');
    setIsInCall(false);
    // Remove room ID from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('room');
    window.history.pushState({}, '', newUrl);
    toast.success('Left the call');
  }, [peer, localStream]);

  const shareRoomLink = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString());
    toast.success('Room link copied to clipboard');
  }, [roomId]);

  useEffect(() => {
    if (!isInCall) {
      setupLocalStream();
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isInCall]);

  if (!isInCall) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-8">
            <Video className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-8">Video Call App</h1>
          
          <div className="space-y-6">
            <button
              onClick={createRoom}
              className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Create New Room
            </button>
            
            <div className="relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gray-300/50" />
              <div className="relative text-center">
                <span className="bg-white px-2 text-sm text-gray-500">or join existing</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter Room ID or URL"
                  value={inputRoomId}
                  onChange={(e) => {
                    // Extract room ID from URL if pasted
                    try {
                      const url = new URL(e.target.value);
                      const roomId = url.searchParams.get('room');
                      setInputRoomId(roomId || e.target.value);
                    } catch {
                      setInputRoomId(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <button
                onClick={joinRoom}
                disabled={!inputRoomId}
                className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative h-screen p-4 pb-24">
        <VideoGrid peers={peers} localStream={localStream} />
        <Controls
          roomId={roomId}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onLeaveCall={leaveCall}
          onShareLink={shareRoomLink}
        />
      </div>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;