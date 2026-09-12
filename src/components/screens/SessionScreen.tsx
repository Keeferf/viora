import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Monitor, Mic, Video, LogOut } from 'lucide-react';
import { Button, Card } from '../ui';
import { AppLayout, TopBar } from '../layout';
import { useSessionStore } from '../../store/useSessionStore';
import { useMediaStore } from '../../store/useMediaStore';

export function SessionScreen() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const {
    connectionStatus,
    peers,
    localPeerId,
    isScreenSharing,
    isAudioMuted,
    isVideoMuted,
    leaveRoom,
    toggleScreenSharing,
    setAudioMuted,
    setVideoMuted,
  } = useSessionStore();
  const { enumerateDevices } = useMediaStore();
  const [showToolbar, setShowToolbar] = useState(true);
  const toolbarTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    enumerateDevices();
    const handleMouseMove = () => {
      setShowToolbar(true);
      if (toolbarTimeout.current) clearTimeout(toolbarTimeout.current);
      toolbarTimeout.current = setTimeout(() => setShowToolbar(false), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (toolbarTimeout.current) clearTimeout(toolbarTimeout.current);
    };
  }, [enumerateDevices]);

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  const peerArray = Array.from(peers.values());
  const localPeer = peerArray.find((p) => p.id === localPeerId);
  const remotePeers = peerArray.filter((p) => p.id !== localPeerId);

  return (
    <AppLayout>
      <TopBar title={`Room: ${roomCode}`} subtitle={connectionStatus} onLeave={handleLeave} />
      <main className="flex-1 flex flex-col relative bg-base">
        <div
          className={`flex-1 grid gap-4 p-4 overflow-auto ${
            remotePeers.length <= 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {remotePeers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center h-full text-muted text-center p-10">
              <div className="mb-4 opacity-50">
                <Monitor size={64} />
              </div>
              <h3 className="text-xl font-medium mb-2">Waiting for participants</h3>
              <p className="text-sm">
                Share the room code{' '}
                <code className="bg-raised px-2 py-0.5 rounded-md">{roomCode}</code> to invite
                others
              </p>
            </div>
          ) : (
            remotePeers.map((peer) => <VideoTile key={peer.id} peer={peer} isRemote />)
          )}
        </div>

        {localPeer && (
          <div className="absolute bottom-[100px] right-6 z-50 w-[280px]">
            <VideoTile peer={localPeer} isRemote={false} isSelf />
          </div>
        )}

        <Toolbar
          isVisible={showToolbar}
          isScreenSharing={isScreenSharing}
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
          onToggleScreenShare={toggleScreenSharing}
          onToggleAudio={setAudioMuted}
          onToggleVideo={setVideoMuted}
          onLeave={handleLeave}
        />
      </main>
    </AppLayout>
  );
}

interface VideoTileProps {
  peer: {
    id: string;
    name: string;
    isScreenSharing: boolean;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    connectionState: string;
    videoTrack?: MediaStreamTrack;
  };
  isRemote: boolean;
  isSelf?: boolean;
}

function Badge({ tone, children }: { tone: 'info' | 'success' | 'danger' | 'neutral'; children: React.ReactNode }) {
  const tones = {
    info: 'bg-accent text-white',
    success: 'bg-success text-black',
    danger: 'bg-danger text-white',
    neutral: 'bg-raised text-secondary',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-[3px] text-[11px] font-semibold rounded-full uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function VideoTile({ peer, isRemote, isSelf }: VideoTileProps) {
  const connectionDots: Record<string, string> = {
    connected: 'bg-success',
    connecting: 'bg-warning',
    disconnected: 'bg-muted',
    failed: 'bg-danger',
    reconnecting: 'bg-warning',
  };

  return (
    <Card padding="none" className="relative flex flex-col min-h-0 overflow-hidden">
      <div className="relative flex-1 min-h-0 bg-raised aspect-video">
        <video autoPlay muted={!isRemote} playsInline className="w-full h-full object-cover" />
        {isSelf && (
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge tone="info">You</Badge>
            {peer.isScreenSharing && <Badge tone="success">Screen</Badge>}
          </div>
        )}
        {!isRemote && isSelf && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {peer.isAudioMuted && (
              <Badge tone="danger">
                <Mic size={10} />
              </Badge>
            )}
            {peer.isVideoMuted && (
              <Badge tone="danger">
                <Video size={10} />
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="p-3 flex items-center justify-between border-t border-line">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${connectionDots[peer.connectionState] || 'bg-muted'}`}
          />
          <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            {peer.name}
          </span>
        </div>
        {isRemote && (
          <div className="flex gap-1">
            {peer.isScreenSharing && <Badge tone="success">Screen</Badge>}
            {peer.isAudioMuted && (
              <Badge tone="neutral">
                <Mic size={10} />
              </Badge>
            )}
            {peer.isVideoMuted && (
              <Badge tone="neutral">
                <Video size={10} />
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

interface ToolbarProps {
  isVisible: boolean;
  isScreenSharing: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  onToggleScreenShare: () => void;
  onToggleAudio: (muted: boolean) => void;
  onToggleVideo: (muted: boolean) => void;
  onLeave: () => void;
}

function Toolbar({
  isVisible,
  isScreenSharing,
  isAudioMuted,
  isVideoMuted,
  onToggleScreenShare,
  onToggleAudio,
  onToggleVideo,
  onLeave,
}: ToolbarProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[200] transition-all duration-200 ${
        isVisible
          ? 'opacity-100 pointer-events-auto translate-x-[-50%] translate-y-0'
          : 'opacity-0 pointer-events-none translate-x-[-50%] translate-y-5'
      }`}
    >
      <Card padding="none" className="flex items-center gap-2 px-4 py-2">
        <Button
          variant={isScreenSharing ? 'primary' : 'secondary'}
          onClick={onToggleScreenShare}
          aria-label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <Monitor size={20} />
        </Button>
        <Button
          variant={isAudioMuted ? 'danger' : 'secondary'}
          onClick={() => onToggleAudio(!isAudioMuted)}
          aria-label={isAudioMuted ? 'Unmute' : 'Mute'}
          title={isAudioMuted ? 'Unmute (M)' : 'Mute (M)'}
        >
          <Mic size={20} />
        </Button>
        <Button
          variant={isVideoMuted ? 'danger' : 'secondary'}
          onClick={() => onToggleVideo(!isVideoMuted)}
          aria-label={isVideoMuted ? 'Start video' : 'Stop video'}
          title={isVideoMuted ? 'Start video (V)' : 'Stop video (V)'}
        >
          <Video size={20} />
        </Button>
        <Button variant="secondary" onClick={onLeave} aria-label="Leave" title="Leave">
          <LogOut size={20} />
        </Button>
      </Card>
    </div>
  );
}
