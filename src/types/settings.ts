export type Theme = 'dark' | 'light' | 'system';

export interface Resolution {
  width: number;
  height: number;
  label: string;
}

export const RESOLUTIONS: Resolution[] = [
  { width: 3840, height: 2160, label: '4K (3840×2160)' },
  { width: 2560, height: 1440, label: '1440p (2560×1440)' },
  { width: 1920, height: 1080, label: '1080p (1920×1080)' },
  { width: 1280, height: 720, label: '720p (1280×720)' },
  { width: 854, height: 480, label: '480p (854×480)' },
  { width: 640, height: 360, label: '360p (640×360)' },
];

export const FRAMERATES = [15, 24, 30, 60] as const;

export interface SettingsState {
  theme: Theme;
  defaultResolution: Resolution;
  defaultFramerate: number;
  hardwareAcceleration: boolean;
  mirrorSelfView: boolean;
  audioInputId: string;
  audioOutputId: string;
  videoInputId: string;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  preferredBitrate: 'auto' | number;
  showStatsOverlay: boolean;
  autoJoinAudio: boolean;
  autoShareScreen: boolean;
  language: string;
}

export const DEFAULT_SETTINGS: SettingsState = {
  theme: 'system',
  defaultResolution: RESOLUTIONS[2],
  defaultFramerate: 30,
  hardwareAcceleration: true,
  mirrorSelfView: true,
  audioInputId: 'default',
  audioOutputId: 'default',
  videoInputId: 'default',
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
  preferredBitrate: 'auto',
  showStatsOverlay: false,
  autoJoinAudio: true,
  autoShareScreen: false,
  language: 'en',
};

export type SettingsAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_RESOLUTION'; payload: Resolution }
  | { type: 'SET_FRAMERATE'; payload: number }
  | { type: 'SET_HARDWARE_ACCELERATION'; payload: boolean }
  | { type: 'SET_MIRROR_SELF_VIEW'; payload: boolean }
  | { type: 'SET_AUDIO_INPUT'; payload: string }
  | { type: 'SET_AUDIO_OUTPUT'; payload: string }
  | { type: 'SET_VIDEO_INPUT'; payload: string }
  | { type: 'SET_NOISE_SUPPRESSION'; payload: boolean }
  | { type: 'SET_ECHO_CANCELLATION'; payload: boolean }
  | { type: 'SET_AUTO_GAIN_CONTROL'; payload: boolean }
  | { type: 'SET_PREFERRED_BITRATE'; payload: 'auto' | number }
  | { type: 'SET_SHOW_STATS_OVERLAY'; payload: boolean }
  | { type: 'SET_AUTO_JOIN_AUDIO'; payload: boolean }
  | { type: 'SET_AUTO_SHARE_SCREEN'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'RESET_DEFAULTS' }
  | { type: 'HYDRATE'; payload: Partial<SettingsState> };