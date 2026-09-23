import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  SlidersHorizontal,
  Video,
  VideoOff,
} from 'lucide-react';
import { AppLayout, TopBar } from '@/components/layout';
import { Button, Select } from '@/components/ui';
import { useMediaStore, useSessionStore, useSettingsStore } from '@/store';
import { FRAMERATES, RESOLUTIONS } from '@/types/settings';
import type { MediaDeviceInfo, PeerState } from '@/types/session';

// ponytail: demo peers stand in for the signaling server — delete once real peer discovery lands
const DEMO_PEERS: PeerState[] = [
  { id: 'demo-ava', name: 'Ava Chen', connectionState: 'connected', isScreenSharing: false, isAudioMuted: false, isVideoMuted: true, quality: 'auto' },
  { id: 'demo-marcus', name: 'Marcus Reid', connectionState: 'connected', isScreenSharing: true, isAudioMuted: true, isVideoMuted: true, quality: 'auto' },
  { id: 'demo-priya', name: 'Priya Nair', connectionState: 'connected', isScreenSharing: false, isAudioMuted: false, isVideoMuted: true, quality: 'auto' },
  { id: 'demo-diego', name: 'Diego Santos', connectionState: 'connected', isScreenSharing: false, isAudioMuted: false, isVideoMuted: true, quality: 'auto' },
];

export function MainScreen() {
  const { roomCode = '------' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const name = searchParams.get('name')?.trim() || 'Guest';

  const peers = useSessionStore((s) => s.peers);
  const localPeerId = useSessionStore((s) => s.localPeerId);
  const localStream = useSessionStore((s) => s.localStream);
  const isAudioMuted = useSessionStore((s) => s.isAudioMuted);
  const isVideoMuted = useSessionStore((s) => s.isVideoMuted);
  const isScreenSharing = useSessionStore((s) => s.isScreenSharing);
  const speakingPeerId = useSessionStore((s) => s.speakingPeerId);
  const joinRoom = useSessionStore((s) => s.joinRoom);
  const leaveRoom = useSessionStore((s) => s.leaveRoom);
  const addPeer = useSessionStore((s) => s.addPeer);
  const setLocalStream = useSessionStore((s) => s.setLocalStream);
  const setAudioMuted = useSessionStore((s) => s.setAudioMuted);
  const setVideoMuted = useSessionStore((s) => s.setVideoMuted);
  const setScreenSharing = useSessionStore((s) => s.setScreenSharing);

  const enumerateDevices = useMediaStore((s) => s.enumerateDevices);
  const detectHardware = useMediaStore((s) => s.detectHardware);
  const mirrorSelfView = useSettingsStore((s) => s.mirrorSelfView);

  const [mediaError, setMediaError] = useState<string | null>(null);
  const initialized = useRef(false);

  // Join + seed demo peers once per mount (StrictMode double-invokes effects).
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    joinRoom(roomCode, roomCode, crypto.randomUUID(), name);
    DEMO_PEERS.forEach((peer) => addPeer(peer));
  }, [roomCode, name, joinRoom, addPeer]);

  // Enumerate devices, then hold a live local stream for the self tile.
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    void enumerateDevices();
    void detectHardware();
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        stream = s;
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setLocalStream(s);
      })
      .catch((err) => {
        if (!cancelled) {
          setMediaError(err instanceof Error ? err.message : 'Camera and microphone unavailable');
        }
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [enumerateDevices, detectHardware, setLocalStream]);

  const handleLeave = useCallback(() => {
    leaveRoom();
    navigate('/');
  }, [leaveRoom, navigate]);

  const tiles = useMemo(() => {
    const list = Array.from(peers.values());
    list.sort((a, b) => (a.id === localPeerId ? -1 : b.id === localPeerId ? 1 : 0));
    return list;
  }, [peers, localPeerId]);

  return (
    <AppLayout
      animated={false}
      topBar={
        <TopBar
          title={roomCode}
          subtitle={`${peers.size} connected`}
          onLeave={handleLeave}
          right={
            <>
              <MediaSettingsButton />
              <Button
                variant={isAudioMuted ? 'danger' : 'ghost'}
                size="sm"
                shape="rounded"
                aria-label={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
                title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
                aria-pressed={isAudioMuted}
                onClick={() => setAudioMuted(!isAudioMuted)}
              >
                {isAudioMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
              <Button
                variant={isVideoMuted ? 'danger' : 'ghost'}
                size="sm"
                shape="rounded"
                aria-label={isVideoMuted ? 'Turn camera on' : 'Turn camera off'}
                title={isVideoMuted ? 'Turn camera on' : 'Turn camera off'}
                aria-pressed={isVideoMuted}
                onClick={() => setVideoMuted(!isVideoMuted)}
              >
                {isVideoMuted ? <VideoOff size={16} /> : <Video size={16} />}
              </Button>
              <Button
                variant={isScreenSharing ? 'primary' : 'ghost'}
                size="sm"
                shape="rounded"
                aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
                title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
                aria-pressed={isScreenSharing}
                onClick={() => setScreenSharing(!isScreenSharing)}
              >
                {isScreenSharing ? <MonitorOff size={16} /> : <Monitor size={16} />}
              </Button>
            </>
          }
        />
      }
    >
      <main className="flex min-h-full w-full flex-col">
        <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6 pt-6 pb-8 sm:px-10 sm:pt-8">
          {mediaError && (
            <div
              role="status"
              className="mb-4 flex items-center gap-2 rounded-[10px] border border-warning/40 bg-warning/10 px-3.5 py-3 text-sm text-warning"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{mediaError}</span>
            </div>
          )}

          <ul className="grid flex-1 auto-rows-min gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((peer, i) => {
              const isLocal = peer.id === localPeerId;
              return (
                <UserTile
                  key={peer.id}
                  peer={peer}
                  isLocal={isLocal}
                  localStream={localStream}
                  videoMuted={isLocal ? isVideoMuted : peer.isVideoMuted}
                  audioMuted={isLocal ? isAudioMuted : peer.isAudioMuted}
                  screenSharing={isLocal ? isScreenSharing : peer.isScreenSharing}
                  mirrored={isLocal && mirrorSelfView}
                  speaking={speakingPeerId === peer.id}
                  delay={i * 60}
                />
              );
            })}
          </ul>
        </div>
      </main>
    </AppLayout>
  );
}

function UserTile({
  peer,
  isLocal,
  localStream,
  videoMuted,
  audioMuted,
  screenSharing,
  mirrored,
  speaking,
  delay,
}: {
  peer: PeerState;
  isLocal: boolean;
  localStream: MediaStream | null;
  videoMuted: boolean;
  audioMuted: boolean;
  screenSharing: boolean;
  mirrored: boolean;
  speaking: boolean;
  delay: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const stream = useMemo(() => {
    if (isLocal) return localStream;
    return peer.videoTrack ? new MediaStream([peer.videoTrack]) : null;
  }, [isLocal, localStream, peer.videoTrack]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const showVideo = !!stream && !videoMuted;

  return (
    <li
      className={`animate-rise relative flex aspect-video flex-col overflow-hidden rounded-[14px] border bg-surface ${
        speaking ? 'border-accent ring-1 ring-accent/40' : 'border-line'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`h-full w-full object-cover ${mirrored ? '-scale-x-100' : ''}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-raised">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 font-display text-2xl text-accent">
            {initials(peer.name)}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8">
        <span className="truncate text-[13px] font-semibold text-white">
          {peer.name}
          {isLocal && <span className="ml-1.5 text-[11px] font-normal text-white/70">You</span>}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {screenSharing && (
            <span className="flex items-center gap-1 rounded-full bg-accent/90 px-2 py-0.5 text-[11px] font-medium text-white">
              <Monitor size={12} />
              Screen
            </span>
          )}
          <span
            aria-label={audioMuted ? 'Microphone muted' : 'Microphone on'}
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              audioMuted ? 'bg-danger text-white' : 'bg-black/50 text-white/80'
            }`}
          >
            {audioMuted ? <MicOff size={13} /> : <Mic size={13} />}
          </span>
        </span>
      </div>
    </li>
  );
}

function MediaSettingsButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="sm"
        shape="rounded"
        aria-label="Media settings"
        title="Media settings"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <SlidersHorizontal size={16} />
      </Button>
      {open && <MediaSettingsPanel />}
    </div>
  );
}

function MediaSettingsPanel() {
  const cameras = useMediaStore((s) => s.cameras);
  const microphones = useMediaStore((s) => s.microphones);
  const speakers = useMediaStore((s) => s.speakers);
  const hardware = useMediaStore((s) => s.hardware);
  const selectedCameraId = useMediaStore((s) => s.selectedCameraId);
  const selectedMicrophoneId = useMediaStore((s) => s.selectedMicrophoneId);
  const selectedSpeakerId = useMediaStore((s) => s.selectedSpeakerId);
  const setSelectedCamera = useMediaStore((s) => s.setSelectedCamera);
  const setSelectedMicrophone = useMediaStore((s) => s.setSelectedMicrophone);
  const setSelectedSpeaker = useMediaStore((s) => s.setSelectedSpeaker);

  const defaultResolution = useSettingsStore((s) => s.defaultResolution);
  const defaultFramerate = useSettingsStore((s) => s.defaultFramerate);
  const dispatch = useSettingsStore((s) => s.dispatch);

  const camera = mediaOptions(hardware?.cameras, cameras, selectedCameraId, 'camera');
  const microphone = mediaOptions(hardware?.microphones, microphones, selectedMicrophoneId, 'microphone');
  const speaker = mediaOptions(hardware?.speakers, speakers, selectedSpeakerId, 'speaker');

  return (
    <div className="absolute right-0 top-full z-[250] mt-2 w-[300px] animate-rise rounded-[14px] border border-line bg-surface p-4 text-left shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)]">
      <h2 className="font-display uppercase tracking-wide text-[15px]">Media settings</h2>
      <p className="mt-0.5 text-xs text-secondary">Pick the devices and quality for this session.</p>
      <div className="mt-4 flex flex-col gap-3">
        <Select
          label="Camera"
          value={camera.value}
          onChange={setSelectedCamera}
          options={camera.options}
        />
        <Select
          label="Microphone"
          value={microphone.value}
          onChange={setSelectedMicrophone}
          options={microphone.options}
        />
        <Select
          label="Speaker"
          value={speaker.value}
          onChange={setSelectedSpeaker}
          options={speaker.options}
        />
        <Select
          label="Resolution"
          value={defaultResolution.label}
          onChange={(value) => {
            const next = RESOLUTIONS.find((r) => r.label === value);
            if (next) dispatch({ type: 'SET_RESOLUTION', payload: next });
          }}
          options={RESOLUTIONS.map((r) => ({ value: r.label, label: r.label }))}
        />
        <Select
          label="Framerate"
          value={String(defaultFramerate)}
          onChange={(value) => dispatch({ type: 'SET_FRAMERATE', payload: Number(value) })}
          options={FRAMERATES.map((f) => ({ value: String(f), label: `${f} fps` }))}
        />
      </div>
    </div>
  );
}

interface MediaOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Backend-detected devices win (names, available before any permission prompt);
 * otherwise fall back to the browser's enumerated devices (which carry the
 * `deviceId` used to actually open a stream). Always returns a value that
 * exists in the options so the select never renders blank.
 */
function mediaOptions(
  detected: string[] | undefined,
  devices: MediaDeviceInfo[],
  selected: string,
  fallback: string,
): { options: MediaOption[]; value: string } {
  let options: MediaOption[];
  if (detected?.length) {
    options = detected.map((name) => ({ value: name, label: name }));
  } else if (devices.length) {
    options = devices.map((device, i) => ({
      value: device.deviceId,
      label: device.label || `${fallback.replace(/^./, (c) => c.toUpperCase())} ${i + 1}`,
    }));
  } else {
    options = [{ value: 'none', label: `No ${fallback} detected`, disabled: true }];
  }
  const value = options.some((option) => option.value === selected && !option.disabled)
    ? selected
    : options[0].value;
  return { options, value };
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}
