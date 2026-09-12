export interface User {
  id: string;
  name: string;
  avatar?: string;
  isLocal: boolean;
}

export interface Room {
  id: string;
  code: string;
  createdAt: number;
  hostId: string;
  peers: User[];
}

export interface PeerState {
  id: string;
  name: string;
  connectionState: RTCPeerConnectionState;
  isScreenSharing: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  videoTrack?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
  screenTrack?: MediaStreamTrack;
  quality: QualityLevel;
  stats?: PeerStats;
}

export interface PeerStats {
  rtt: number;
  packetsLost: number;
  bitrate: number;
  framerate: number;
  resolution: { width: number; height: number };
  timestamp: number;
}

export type QualityLevel = 'auto' | '1080p' | '720p' | '480p' | '360p';

export interface SimulcastLayer {
  rid: string;
  scaleResolutionDownBy: number;
  maxBitrate: number;
  maxFramerate: number;
  active: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

export interface SessionState {
  roomId: string | null;
  roomCode: string | null;
  localPeerId: string | null;
  connectionStatus: ConnectionStatus;
  peers: Map<string, PeerState>;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isScreenSharing: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  currentQuality: QualityLevel;
  availableLayers: SimulcastLayer[];
  speakingPeerId: string | null;
}

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  groupId: string;
}

export interface ScreenSource {
  id: string;
  name: string;
  type: 'screen' | 'window' | 'tab';
  thumbnail?: string;
  displayId?: string;
  appIcon?: string;
}

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

export interface VideoConstraints {
  width?: { ideal: number; max: number };
  height?: { ideal: number; max: number };
  frameRate?: { ideal: number; max: number };
  facingMode?: 'user' | 'environment';
  deviceId?: { exact: string };
}

export interface AudioConstraints {
  deviceId?: { exact: string };
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  sampleRate?: number;
  channelCount?: number;
}