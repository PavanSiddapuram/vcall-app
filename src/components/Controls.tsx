import React from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ControlsProps {
  roomId: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onLeaveCall: () => void;
  onShareLink: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  roomId,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onLeaveCall,
  onShareLink,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success('Room ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 flex items-center justify-center gap-4">
      <button
        onClick={onToggleVideo}
        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        {isVideoEnabled ? (
          <Video className="w-6 h-6 text-white" />
        ) : (
          <VideoOff className="w-6 h-6 text-red-500" />
        )}
      </button>
      
      <button
        onClick={onToggleAudio}
        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        {isAudioEnabled ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <MicOff className="w-6 h-6 text-red-500" />
        )}
      </button>
      
      <button
        onClick={onLeaveCall}
        className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
      >
        <PhoneOff className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={copyRoomId}
        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
        title="Copy Room ID"
      >
        {copied ? (
          <Check className="w-6 h-6 text-green-500" />
        ) : (
          <Copy className="w-6 h-6 text-white" />
        )}
      </button>

      <button
        onClick={onShareLink}
        className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
        title="Share Room Link"
      >
        <LinkIcon className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default Controls;