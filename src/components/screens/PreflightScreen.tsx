import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Video,
  Monitor,
  AlertCircle,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { Button, Select, Card, CardHeader, CardTitle, CardBody } from '../ui';
import { AppLayout, TopBar } from '../layout';
import { useMediaStore } from '../../store/useMediaStore';
import { useSettingsStore } from '../../store/useSettingsStore';

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
  const [showCameraSelect, setShowCameraSelect] = useState(false);
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
      <TopBar title={`Room: ${roomCode}`} subtitle={isHost ? 'Host' : 'Guest'} onLeave={handleBack} />
      <main className="flex-1 p-8 flex flex-col gap-6 overflow-auto">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Camera Preview</CardTitle>
            </CardHeader>
            <CardBody className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
              <div className="relative w-full max-w-[640px] aspect-video rounded-2xl overflow-hidden bg-raised">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${mirrorSelfView ? '-scale-x-100' : ''}`}
                />
                {isEnumerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 size={32} className="text-accent animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-4 w-full max-w-[640px]">
                <div className="flex-1">
                  <Select
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCameraSelect(!showCameraSelect)}
                  aria-label="Camera settings"
                >
                  <Video size={18} />
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Audio Settings</CardTitle>
            </CardHeader>
            <CardBody className="flex-1 flex flex-col gap-5">
              <div>
                <label className="text-[13px] font-medium text-secondary">Microphone</label>
                <div className="mt-1.5">
                  <Select
                    value={selectedMicrophoneId}
                    onChange={(e) => setSelectedMicrophone(e.target.value)}
                    options={microphones.map((m) => ({
                      value: m.deviceId,
                      label: m.label || `Mic ${m.deviceId.slice(0, 8)}`,
                    }))}
                    placeholder="Select microphone"
                    disabled={isEnumerating}
                  />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-medium text-secondary">Speaker (Output)</label>
                <div className="mt-1.5">
                  <Select
                    value="default"
                    onChange={() => {}}
                    options={[{ value: 'default', label: 'Default Device' }]}
                    placeholder="Select speaker"
                  />
                </div>
              </div>
              <div className="p-4 bg-raised rounded-[10px]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-medium">Input Level</span>
                  <span className="text-xs text-muted">-24 dB</span>
                </div>
                <div className="h-2 bg-base rounded-full overflow-hidden">
                  <div className="w-[40%] h-full bg-accent rounded-full transition-[width] duration-100" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Screen Share Source</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ScreenSourceOption type="screen" label="Entire Screen" icon={Monitor} />
              <ScreenSourceOption type="window" label="Application Window" icon={Monitor} />
              <ScreenSourceOption type="tab" label="Browser Tab" icon={Monitor} />
            </div>
            <div className="flex items-center gap-3 mt-4 p-3 bg-raised rounded-[10px]">
              <input
                type="checkbox"
                id="system-audio"
                className="accent-accent w-4 h-4"
              />
              <label htmlFor="system-audio" className="text-sm cursor-pointer">
                Share system audio
              </label>
            </div>
          </CardBody>
        </Card>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 border border-danger rounded-[10px] text-danger text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between gap-4 mt-auto">
          <Button variant="secondary" onClick={handleBack} disabled={isStarting}>
            <ArrowLeft size={18} />
            Back
          </Button>
          <Button
            fullWidth
            onClick={handleStart}
            loading={isStarting}
            className="max-w-[280px]"
          >
            Start Sharing
            <ChevronDown size={18} />
          </Button>
        </div>
      </main>
    </AppLayout>
  );
}

function ScreenSourceOption({
  label,
  icon: Icon,
}: {
  type: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <button className="inline-flex flex-col items-center gap-3 p-5 text-center min-h-[120px] rounded-[10px] bg-raised text-primary border border-line hover:bg-hover transition-colors cursor-pointer">
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20">
        <Icon size={28} className="text-accent" />
      </span>
      <span className="font-medium">{label}</span>
      <span className="text-xs text-muted">Click to select</span>
    </button>
  );
}
