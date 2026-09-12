import { create } from 'zustand';
import type { MediaDeviceInfo, ScreenSource } from '@/types/session';

interface MediaStore {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  screenSources: ScreenSource[];
  selectedCameraId: string;
  selectedMicrophoneId: string;
  selectedSpeakerId: string;
  selectedScreenSourceId: string | null;
  isEnumerating: boolean;
  error: string | null;
  enumerateDevices: () => Promise<void>;
  setSelectedCamera: (id: string) => void;
  setSelectedMicrophone: (id: string) => void;
  setSelectedSpeaker: (id: string) => void;
  setSelectedScreenSource: (id: string | null) => void;
  setScreenSources: (sources: ScreenSource[]) => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  cameras: [],
  microphones: [],
  speakers: [],
  screenSources: [],
  selectedCameraId: 'default',
  selectedMicrophoneId: 'default',
  selectedSpeakerId: 'default',
  selectedScreenSourceId: null,
  isEnumerating: false,
  error: null,
  
  enumerateDevices: async () => {
    set({ isEnumerating: true, error: null });
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(s => s.getTracks().forEach(t => t.stop()));
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const cameras = devices.filter(d => d.kind === 'videoinput');
      const microphones = devices.filter(d => d.kind === 'audioinput');
      const speakers = devices.filter(d => d.kind === 'audiooutput');

      set({
        cameras,
        microphones,
        speakers,
        selectedCameraId: cameras[0]?.deviceId || 'default',
        selectedMicrophoneId: microphones[0]?.deviceId || 'default',
        selectedSpeakerId: speakers[0]?.deviceId || 'default',
        isEnumerating: false,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to enumerate devices', isEnumerating: false });
    }
  },
  
  setSelectedCamera: (id) => set({ selectedCameraId: id }),
  setSelectedMicrophone: (id) => set({ selectedMicrophoneId: id }),
  setSelectedSpeaker: (id) => set({ selectedSpeakerId: id }),
  setSelectedScreenSource: (id) => set({ selectedScreenSourceId: id }),
  setScreenSources: (sources) => set({ screenSources: sources }),
}));