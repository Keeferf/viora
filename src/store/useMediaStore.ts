import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { HardwareInfo, MediaDeviceInfo, ScreenSource } from '@/types/session';

interface MediaStore {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  screenSources: ScreenSource[];
  hardware: HardwareInfo | null;
  selectedCameraId: string;
  selectedMicrophoneId: string;
  selectedSpeakerId: string;
  selectedScreenSourceId: string | null;
  isEnumerating: boolean;
  isDetectingHardware: boolean;
  error: string | null;
  enumerateDevices: () => Promise<void>;
  detectHardware: () => Promise<void>;
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
  hardware: null,
  selectedCameraId: 'default',
  selectedMicrophoneId: 'default',
  selectedSpeakerId: 'default',
  selectedScreenSourceId: null,
  isEnumerating: false,
  isDetectingHardware: false,
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

  // Runs in the Rust backend so hardware presence is known before the browser
  // permission prompt (and outside a Tauri shell it just stays null).
  detectHardware: async () => {
    set({ isDetectingHardware: true });
    try {
      const hardware = await invoke<HardwareInfo>('detect_hardware');
      set({ hardware, isDetectingHardware: false });
    } catch {
      set({ isDetectingHardware: false });
    }
  },

  setSelectedCamera: (id) => set({ selectedCameraId: id }),
  setSelectedMicrophone: (id) => set({ selectedMicrophoneId: id }),
  setSelectedSpeaker: (id) => set({ selectedSpeakerId: id }),
  setSelectedScreenSource: (id) => set({ selectedScreenSourceId: id }),
  setScreenSources: (sources) => set({ screenSources: sources }),
}));
