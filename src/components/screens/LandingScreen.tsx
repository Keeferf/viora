import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor, Users, Zap, Shield, type LucideIcon } from 'lucide-react';
import { JoinForm } from './JoinForm';
import { CreateForm } from './CreateForm';
import { AppLayout, TopBar } from '@/components/layout';
import { Button } from '@/components/ui';

export function LandingScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (roomCode: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call - will connect to signaling server later
      await new Promise((r) => setTimeout(r, 800));
      navigate(`/preflight/${roomCode}?name=${encodeURIComponent(name)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
      setIsLoading(false);
    }
  };

  const handleCreate = async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call - will create room via signaling server later
      await new Promise((r) => setTimeout(r, 800));
      const roomCode = generateRoomCode();
      navigate(`/preflight/${roomCode}?name=${encodeURIComponent(name)}&host=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setIsLoading(false);
    }
  };

  return (
    <AppLayout topBar={<TopBar />}>
      <main className="flex min-h-full w-full max-w-[1200px] mx-auto flex-col px-6 sm:px-10 pt-6 sm:pt-10 pb-6">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 items-start my-auto">
          <div className="animate-rise">
            <h1 className="font-display uppercase leading-[0.92] tracking-tight text-[clamp(2.75rem,6vw,5.25rem)]">
              Share the
              <br />
              screen.
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-secondary max-w-[46ch]">
              Viora opens a direct WebRTC line between you and your team. Drop in with a
              six-character code, pass the screen around, and get out. Nothing to install
              beyond this window.
            </p>

            <dl className="mt-7 flex divide-x divide-line border-y border-line max-w-[520px]">
              <div className="flex-1 py-3 pr-4">
                <dt className="text-xs text-muted">Setup</dt>
                <dd className="font-display text-xl tracking-wide">ZERO</dd>
              </div>
              <div className="flex-1 px-4 py-3">
                <dt className="text-xs text-muted">Room code</dt>
                <dd className="font-display text-xl tracking-wide">6 CHARACTERS</dd>
              </div>
              <div className="flex-1 pl-4 py-3">
                <dt className="text-xs text-muted">Relay via server</dt>
                <dd className="font-display text-xl tracking-wide text-accent">NEVER</dd>
              </div>
            </dl>
          </div>

          <div
            className="animate-rise rounded-[18px] border border-line bg-surface overflow-hidden"
            style={{ animationDelay: '90ms' }}
          >
            <div className="grid grid-cols-2 gap-1 p-1.5 mt-2 mx-4 rounded-full bg-base border border-line">
              <Button
                variant={activeTab === 'join' ? 'primary' : 'ghost'}
                fullWidth
                onClick={() => setActiveTab('join')}
              >
                Join session
              </Button>
              <Button
                variant={activeTab === 'create' ? 'primary' : 'ghost'}
                fullWidth
                onClick={() => setActiveTab('create')}
              >
                Create session
              </Button>
            </div>
            <div className="p-4 pt-3 min-h-[300px]">
              {activeTab === 'join' ? (
                <JoinForm onJoin={handleJoin} isLoading={isLoading} error={error ?? undefined} />
              ) : (
                <CreateForm
                  onCreate={handleCreate}
                  isLoading={isLoading}
                  error={error ?? undefined}
                />
              )}
              <p className="text-center text-xs text-muted mt-3 leading-relaxed">
                By using Viora, you agree to our <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>

        <section
          aria-label="How Viora works"
          className="mt-auto pt-8 animate-rise"
          style={{ animationDelay: '160ms' }}
        >
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <FeatureRow
              icon={Zap}
              title="Instant sessions"
              desc="Create or join rooms with a 6-character code. No accounts, no invites, no waiting room."
              meta="6-character code"
            />
            <FeatureRow
              icon={Monitor}
              title="Multi-source sharing"
              desc="Share the entire screen, a single window, or a browser tab, with system audio when you need it."
              meta="Screen · Window · Tab"
            />
            <FeatureRow
              icon={Shield}
              title="Peer-to-peer by default"
              desc="Direct WebRTC connections with end-to-end encryption. Media never passes through our servers."
              meta="WebRTC P2P"
            />
            <FeatureRow
              icon={Users}
              title="Adaptive quality"
              desc="Bitrate follows the weakest connection in the room, so the session stays smooth for everyone."
              meta="Auto bitrate"
            />
          </ul>
        </section>
      </main>
    </AppLayout>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  desc,
  meta,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  meta: string;
}) {
  return (
    <li className="flex flex-col rounded-[14px] border border-line bg-surface/50 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-[10px] bg-accent/15">
          <Icon size={18} className="text-accent" />
        </span>
        <span className="text-[11px] font-medium text-muted border border-line rounded-full px-2.5 py-0.5 whitespace-nowrap">
          {meta}
        </span>
      </div>
      <h2 className="font-semibold text-[14px] mt-3">{title}</h2>
      <p className="text-[13px] text-secondary leading-relaxed mt-1">{desc}</p>
    </li>
  );
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
