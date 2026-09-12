import { create } from 'zustand';
import type { SessionState, PeerState, QualityLevel, SimulcastLayer, ConnectionStatus } from '@/types/session';

type SessionStore = SessionState & {
  joinRoom: (roomId: string, roomCode: string, localPeerId: string, name: string) => void;
  leaveRoom: () => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  addPeer: (peer: PeerState) => void;
  removePeer: (peerId: string) => void;
  updatePeer: (peerId: string, updates: Partial<PeerState>) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setScreenStream: (stream: MediaStream | null) => void;
  setScreenSharing: (sharing: boolean) => void;
  toggleScreenSharing: () => void;
  setAudioMuted: (muted: boolean) => void;
  setVideoMuted: (muted: boolean) => void;
  setQuality: (quality: QualityLevel) => void;
  setAvailableLayers: (layers: SimulcastLayer[]) => void;
  setSpeakingPeer: (peerId: string | null) => void;
  reset: () => void;
};

const INITIAL_STATE: SessionState = {
  roomId: null,
  roomCode: null,
  localPeerId: null,
  connectionStatus: 'disconnected',
  peers: new Map(),
  localStream: null,
  screenStream: null,
  isScreenSharing: false,
  isAudioMuted: false,
  isVideoMuted: false,
  currentQuality: 'auto',
  availableLayers: [],
  speakingPeerId: null,
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...INITIAL_STATE,
  
  joinRoom: (roomId, roomCode, localPeerId, name) => {
    set({
      roomId,
      roomCode,
      localPeerId,
      connectionStatus: 'connecting',
      peers: new Map([[localPeerId, {
        id: localPeerId,
        name,
        connectionState: 'connecting',
        isScreenSharing: false,
        isAudioMuted: false,
        isVideoMuted: false,
        quality: 'auto',
      }]]),
    });
  },
  
  leaveRoom: () => {
    const { localStream, screenStream } = get();
    localStream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    set(INITIAL_STATE);
  },
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  addPeer: (peer) => set((state) => {
    const newPeers = new Map(state.peers);
    newPeers.set(peer.id, peer);
    return { peers: newPeers };
  }),
  
  removePeer: (peerId) => set((state) => {
    const newPeers = new Map(state.peers);
    newPeers.delete(peerId);
    return { peers: newPeers };
  }),
  
  updatePeer: (peerId, updates) => set((state) => {
    const peer = state.peers.get(peerId);
    if (!peer) return state;
    const newPeers = new Map(state.peers);
    newPeers.set(peerId, { ...peer, ...updates });
    return { peers: newPeers };
  }),
  
  setLocalStream: (stream) => set({ localStream: stream }),
  
  setScreenStream: (stream) => set({ screenStream: stream }),
  
  setScreenSharing: (sharing) => set({ isScreenSharing: sharing }),
  
  toggleScreenSharing: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  
  setAudioMuted: (muted) => set({ isAudioMuted: muted }),
  
  setVideoMuted: (muted) => set({ isVideoMuted: muted }),
  
  setQuality: (quality) => set({ currentQuality: quality }),
  
  setAvailableLayers: (layers) => set({ availableLayers: layers }),
  
  setSpeakingPeer: (peerId) => set({ speakingPeerId: peerId }),
  
  reset: () => {
    const { localStream, screenStream } = get();
    localStream?.getTracks().forEach(t => t.stop());
    screenStream?.getTracks().forEach(t => t.stop());
    set(INITIAL_STATE);
  },
}));