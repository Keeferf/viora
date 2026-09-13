import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Video,
  Monitor,
  AppWindow,
  Globe,
  AlertCircle,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { AppLayout, TopBar } from '@/components/layout';
import { useMediaStore } from '@/store/useMediaStore';
import { useSettingsStore } from '@/store/useSettingsStore';

type SourceKind = 'screen' | 'window' | 'tab';

const SOURCES: { kind: SourceKind; label: string; hint: string; icon: LucideIcon }[] = [
  { kind: 'screen', label: 'Entire screen', hint: 'Everything, all monitors', icon: Monitor },
  { kind: 'window', label: 'Application window', hint: 'One app, nothing else', icon: AppWindow },
  { kind: 'tab', label: 'Browser tab', hint: 'One tab plus its audio', icon: Globe },
];

export function PreflightScreen() {
  const { roomId: roomIdParam } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomCode = roomIdParam || searchParams.get('roomId') || '';
  const name = searchParams.get('name') || '';
  const isHost = searchParams.get('host') === 'true';

  const {
    enumerateDevices,
    cameras,
    microphones,
    selectedCameraId,
    selectedMicrophoneId,
    setSelectedCamera,
    setSelectedMicrophone,
  } = useMediaStore();
  const { mirrorSelfView } = useSettingsStore();
  const [isEnumerating, setIsEnumerating] = useState(true);
  const [source, setSource] = useState<SourceKind>('screen');
  const [shareAudio, setShareAudio] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    enumerateDevices().finally(() => setIsEnumerating(false));
  }, [enumerateDevices]);

  useEffect(() => {
    if (cameras.length === 0) return;
    const deviceId = selectedCameraId === 'default' ? cameras[0]?.deviceId : selectedCameraId;
    let stream: MediaStream | null = null;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [selectedCameraId, cameras]);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      navigate(`/session/${roomCode}`, { state: { name, isHost } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
      setIsStarting(false);
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <AppLayout>
      <TopBar title={`Room ${roomCode}`} subtitle={isHost ? 'You are hosting' : `Joining as ${name || 'guest'}`} onLeave={handleBack} />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 sm:px-10 py-8">
        <div className="animate-rise">
          <h1 className="font-display uppercase tracking-tight leading-none text-[clamp(2rem,4.5vw,3.2rem)]">
            Check, pick, go live
          </h1>
          <p className="text-[15px] text-secondary mt-2 max-w-[60ch]">
            Three quick checks before you open the room. Your camera never leaves this
            device until you start sharing.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mt-8 items-start">
          <section aria-label="Camera preview" className="animate-rise" style={{ animationDelay: '60ms' }}>
            <StepHeading n="01" title="Check your camera" />
            <div className="relative w-full aspect-video rounded-[14px] overflow-hidden bg-black border border-line mt-3">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${mirrorSelfView ? '-scale-x-100' : ''}`}
              />
              {isEnumerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 size={32} className="text-accent animate-spin" />
                </div>
              )}
              <span className="absolute top-3 left-3 flex items-center gap-1.5 text-xs font-medium bg-black/65 backdrop-blur px-2.5 py-1 rounded-full">
                <Video size={12} className="text-accent" />
                Preview
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1">
                <Select
                  aria-label="Camera"
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  options={cameras.map((c) => ({
                    value: c.deviceId,
                    label: c.label || `Camera ${c.deviceId.slice(0, 8)}`,
                  }))}
                  placeholder="Select camera"
                  disabled={isEnumerating}
                />
              </div>
            </div>

            <div className="mt-6">
              <StepHeading n="02" title="Check your microphone" />
              <div className="mt-3 rounded-[14px] border border-line bg-surface p-4">
                <Select
                  aria-label="Microphone"
                  value={selectedMicrophoneId}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  options={microphones.map((m) => ({
                    value: m.deviceId,
                    label: m.label || `Mic ${m.deviceId.slice(0, 8)}`,
                  }))}
                  placeholder="Select microphone"
                  disabled={isEnumerating}
                />
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] font-medium">Input level</span>
                    <span className="text-xs text-muted">live</span>
                  </div>
                  <div className="h-2 bg-base rounded-full overflow-hidden border border-line">
                    <div className="w-[40%] h-full bg-success rounded-full transition-[width] duration-100" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Share source" className="animate-rise" style={{ animationDelay: '120ms' }}>
            <StepHeading n="03" title="Pick what to share" />
            <div role="radiogroup" aria-label="Screen share source" className="mt-3 flex flex-col rounded-[14px] border border-line bg-surface overflow-hidden">
              {SOURCES.map((s, i) => {
                const active = source === s.kind;
                const Icon = s.icon;
                return (
                  <button
                    key={s.kind}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSource(s.kind)}
                    className={`flex items-center gap-3.5 px-4 py-4 text-left transition-colors cursor-pointer ${
                      i > 0 ? 'border-t border-line' : ''
                    } ${active ? 'bg-accent/10' : 'hover:bg-hover'}`}
                  >
                    <span
                      className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-[10px] ${
                        active ? 'bg-accent text-white' : 'bg-raised text-secondary'
                      }`}
                    >
                      <Icon size={19} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-sm">{s.label}</span>
                      <span className="block text-xs text-muted mt-0.5">{s.hint}</span>
                    </span>
                    <span
                      className={`flex items-center justify-center w-5 h-5 shrink-0 rounded-full border ${
                        active ? 'border-accent bg-accent text-white' : 'border-muted text-transparent'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="flex items-center gap-3 mt-3 px-4 py-3.5 rounded-[14px] border border-line bg-surface cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={shareAudio}
                onChange={(e) => setShareAudio(e.target.checked)}
                className="accent-accent w-4 h-4"
              />
              Share system audio
            </label>

            {error && (
              <div className="flex items-center gap-2 mt-4 px-4 py-3 bg-danger/10 border border-danger/40 rounded-[10px] text-danger text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-5">
              <Button variant="secondary" onClick={handleBack} disabled={isStarting}>
                <ArrowLeft size={18} />
                Back
              </Button>
              <Button size="lg" fullWidth onClick={handleStart} loading={isStarting} className="flex-1">
                Start sharing
                <ArrowRight size={18} />
              </Button>
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}

function StepHeading({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-display text-sm text-ember tracking-widest">{n}</span>
      <h2 className="font-display uppercase tracking-wide text-lg">{title}</h2>
    </div>
  );
}
