import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SettingsState, SettingsAction, DEFAULT_SETTINGS } from '@/types/settings';

type SettingsStore = SettingsState & {
  dispatch: (action: SettingsAction) => void;
  reset: () => void;
};

const STORAGE_KEY = 'viora-settings';

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      dispatch: (action: SettingsAction) => {
        switch (action.type) {
          case 'SET_RESOLUTION':
            set({ defaultResolution: action.payload });
            break;
          case 'SET_FRAMERATE':
            set({ defaultFramerate: action.payload });
            break;
          case 'SET_HARDWARE_ACCELERATION':
            set({ hardwareAcceleration: action.payload });
            break;
          case 'SET_MIRROR_SELF_VIEW':
            set({ mirrorSelfView: action.payload });
            break;
          case 'SET_AUDIO_INPUT':
            set({ audioInputId: action.payload });
            break;
          case 'SET_AUDIO_OUTPUT':
            set({ audioOutputId: action.payload });
            break;
          case 'SET_VIDEO_INPUT':
            set({ videoInputId: action.payload });
            break;
          case 'SET_NOISE_SUPPRESSION':
            set({ noiseSuppression: action.payload });
            break;
          case 'SET_ECHO_CANCELLATION':
            set({ echoCancellation: action.payload });
            break;
          case 'SET_AUTO_GAIN_CONTROL':
            set({ autoGainControl: action.payload });
            break;
          case 'SET_PREFERRED_BITRATE':
            set({ preferredBitrate: action.payload });
            break;
          case 'SET_SHOW_STATS_OVERLAY':
            set({ showStatsOverlay: action.payload });
            break;
          case 'SET_AUTO_JOIN_AUDIO':
            set({ autoJoinAudio: action.payload });
            break;
          case 'SET_AUTO_SHARE_SCREEN':
            set({ autoShareScreen: action.payload });
            break;
          case 'SET_LANGUAGE':
            set({ language: action.payload });
            break;
          case 'RESET_DEFAULTS':
            set(DEFAULT_SETTINGS);
            break;
          case 'HYDRATE':
            set({ ...get(), ...action.payload });
            break;
        }
      },
      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { dispatch, reset, ...rest } = state;
        return rest;
      },
    }
  )
);