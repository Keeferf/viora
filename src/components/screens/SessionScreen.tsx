import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Monitor, Mic, MicOff, Video, VideoOff, LogOut, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { AppLayout, TopBar } from '@/components/layout';
import { useSessionStore } from '@/store/useSessionStore';
import { useMediaStore } from '@/store/useMediaStore';

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
  const [copied, setCopied] = useState(false);
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

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — code stays visible */
    }
  };

  const peerArray = Array.from(peers.values());
  const localPeer = peerArray.find((p) => p.id === localPeerId);
  const remotePeers = peerArray.filter((p) => p.id !== localPeerId);

  return (
    <AppLayout>
      <TopBar title={`Room ${roomCode}`} subtitle={connectionStatus} onLeave={handleLeave} />
      <main className="flex-1 flex flex-col relative bg-black/40">
        {remotePeers.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-12 max-w-[1200px] w-full mx-auto">
            <p className="flex items-center gap-2 text-sm text-secondary">
              <span className="inline-block w-2 h-2 rounded-full bg-warning animate-pulse" />
              Frequency open, nobody tuned in yet
            </p>
            <h2 className="font-display uppercase leading-[0.95] tracking-tight text-[clamp(2.6rem,7vw,5.5rem)] mt-4">
              Pass this
              <br />
              code around
            </h2>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <span className="room-code-type font-display text-4xl sm:text-5xl text-primary bg-surface border border-line rounded-[14px] px-7 py-4">
                {roomCode}
              </span>
              <Button variant="secondary" onClick={handleCopyCode}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied' : 'Copy code'}
              </Button>
            </div>
            <p className="text-sm text-muted mt-5 max-w-[52ch]">
              Anyone with the code joins straight into this room. Your camera stays
              local until someone arrives.
            </p>
          </div>
        ) : (
          <div
            className={`flex-1 grid gap-1.5 p-3 overflow-auto content-start ${
              remotePeers.length <= 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {remotePeers.map((peer) => (
              <VideoTile key={peer.id} peer={peer} isRemote />
            ))}
          </div>
        )}

        {localPeer && (
          <div
            className={`z-50 overflow-hidden rounded-[14px] border bg-black ${
              localPeer.isScreenSharing ? 'border-accent' : 'border-line'
            } ${
              remotePeers.length === 0
                ? 'mx-6 sm:mx-10 mb-6 max-w-[320px]'
                : 'absolute bottom-24 right-5 w-[240px] shadow-2xl'
            }`}
          >
            <VideoTile peer={localPeer} isRemote={false} isSelf bare />
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
  bare?: boolean;
}

const connectionDots: Record<string, string> = {
  connected: 'bg-success',
  connecting: 'bg-warning',
  disconnected: 'bg-muted',
  failed: 'bg-danger',
  reconnecting: 'bg-warning',
};

function VideoTile({ peer, isRemote, isSelf, bare }: VideoTileProps) {
  const inner = (
    <>
      <div className="relative flex-1 min-h-0 bg-black aspect-video">
        <video autoPlay muted={!isRemote} playsInline className="w-full h-full object-cover" />
        {peer.isVideoMuted && (
          <div className="absolute inset-0 flex items-center justify-center bg-raised">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-hover font-display text-lg">
              {peer.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-3 pb-2.5 pt-8 bg-gradient-to-t from-black/80 to-transparent">
          <span className="flex items-center gap-2 min-w-0 text-sm">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${connectionDots[peer.connectionState] || 'bg-muted'}`}
            />
            <span className="font-medium text-white truncate">
              {isSelf ? `${peer.name} (you)` : peer.name}
            </span>
          </span>
          <span className="flex gap-1 shrink-0">
            {peer.isScreenSharing && (
              <StatusPill tone="live">
                <Monitor size={11} /> Sharing
              </StatusPill>
            )}
            {peer.isAudioMuted && (
              <StatusPill tone="off">
                <MicOff size={11} /> Muted
              </StatusPill>
            )}
            {peer.isVideoMuted && (
              <StatusPill tone="off">
                <VideoOff size={11} /> No video
              </StatusPill>
            )}
          </span>
        </div>
      </div>
    </>
  );

  if (bare) return inner;

  return (
    <div className="relative flex flex-col min-h-0 overflow-hidden rounded-[14px] border border-line bg-surface">
      {inner}
    </div>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: 'live' | 'off';
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-full ${
        tone === 'live' ? 'bg-success/90 text-black' : 'bg-black/65 text-white backdrop-blur'
      }`}
    >
      {children}
    </span>
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
  const btn =
    'flex items-center justify-center w-11 h-11 rounded-full transition-colors cursor-pointer';
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[200] transition-all duration-200 ${
        isVisible
          ? 'opacity-100 pointer-events-auto translate-x-[-50%] translate-y-0'
          : 'opacity-0 pointer-events-none translate-x-[-50%] translate-y-5'
      }`}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface/90 backdrop-blur-md px-2.5 py-2">
        <button
          onClick={onToggleScreenShare}
          aria-label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          className={`${btn} ${isScreenSharing ? 'bg-accent text-white' : 'text-secondary hover:bg-hover hover:text-primary'}`}
        >
          <Monitor size={19} />
        </button>
        <button
          onClick={() => onToggleAudio(!isAudioMuted)}
          aria-label={isAudioMuted ? 'Unmute' : 'Mute'}
          title={isAudioMuted ? 'Unmute (M)' : 'Mute (M)'}
          className={`${btn} ${isAudioMuted ? 'bg-danger text-white' : 'text-secondary hover:bg-hover hover:text-primary'}`}
        >
          {isAudioMuted ? <MicOff size={19} /> : <Mic size={19} />}
        </button>
        <button
          onClick={() => onToggleVideo(!isVideoMuted)}
          aria-label={isVideoMuted ? 'Start video' : 'Stop video'}
          title={isVideoMuted ? 'Start video (V)' : 'Stop video (V)'}
          className={`${btn} ${isVideoMuted ? 'bg-danger text-white' : 'text-secondary hover:bg-hover hover:text-primary'}`}
        >
          {isVideoMuted ? <VideoOff size={19} /> : <Video size={19} />}
        </button>
        <span className="w-px h-6 bg-line mx-1" aria-hidden />
        <button
          onClick={onLeave}
          aria-label="Leave"
          title="Leave"
          className={`${btn} text-secondary hover:bg-danger hover:text-white`}
        >
          <LogOut size={19} />
        </button>
      </div>
    </div>
  );
}
