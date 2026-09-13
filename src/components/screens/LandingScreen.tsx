import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor, Users, Zap, Shield, Radio, type LucideIcon } from 'lucide-react';
import { JoinForm } from './JoinForm';
import { CreateForm } from './CreateForm';
import { AppLayout } from '@/components/layout/AppLayout';
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
    <AppLayout>
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16 pb-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 items-start">
          <div className="animate-rise">
            <p className="flex items-center gap-2 text-sm text-secondary mb-5">
              <span className="inline-block w-2 h-2 rounded-full bg-ember animate-[live-ping_2s_ease-out_infinite]" />
              Peer-to-peer screen sharing, no accounts
            </p>
            <h1 className="font-display uppercase leading-[0.92] tracking-tight text-[clamp(3.2rem,8vw,6.5rem)]">
              Share the
              <br />
              screen.
              <br />
              <span className="display-outline">Keep the room.</span>
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-secondary max-w-[46ch]">
              Viora opens a direct WebRTC line between you and your team. Drop in with a
              six-character code, pass the screen around, and get out. Nothing to install
              beyond this window.
            </p>

            <dl className="mt-8 flex divide-x divide-line border-y border-line max-w-[520px]">
              <div className="flex-1 py-3 pr-4">
                <dt className="text-xs text-muted">Setup</dt>
                <dd className="font-display text-xl tracking-wide">ZERO</dd>
              </div>
              <div className="flex-1 px-4 py-3">
                <dt className="text-xs text-muted">Room code</dt>
                <dd className="font-display text-xl tracking-wide">6 CHARS</dd>
              </div>
              <div className="flex-1 pl-4 py-3">
                <dt className="text-xs text-muted">Relay via server</dt>
                <dd className="font-display text-xl tracking-wide text-success">NEVER</dd>
              </div>
            </dl>
          </div>

          <div
            className="animate-rise rounded-[18px] border border-line bg-surface overflow-hidden"
            style={{ animationDelay: '90ms' }}
          >
            <div className="flex items-center gap-1.5 px-5 pt-4" aria-hidden>
              <span className="w-2.5 h-2.5 rounded-full bg-danger/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-success/80" />
              <span className="ml-2 flex items-center gap-1.5 text-xs text-muted">
                <Radio size={12} />
                viora console
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 p-2 mt-3 mx-4 rounded-full bg-base border border-line">
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
            <div className="p-5 pt-4">
              {activeTab === 'join' ? (
                <JoinForm onJoin={handleJoin} isLoading={isLoading} error={error ?? undefined} />
              ) : (
                <CreateForm
                  onCreate={handleCreate}
                  isLoading={isLoading}
                  error={error ?? undefined}
                />
              )}
              <p className="text-center text-xs text-muted mt-4 leading-relaxed">
                By using Viora, you agree to our <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>

        <section aria-label="How Viora works" className="mt-14 animate-rise" style={{ animationDelay: '160ms' }}>
          <ul className="border-t border-line">
            <FeatureRow
              icon={Zap}
              title="Instant sessions"
              desc="Create or join rooms with a 6-character code. No accounts, no invites, no waiting room."
              meta="6-char code"
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
              last
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
  last = false,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  meta: string;
  last?: boolean;
}) {
  return (
    <li
      className={`flex items-start gap-4 py-5 ${last ? 'border-b border-line' : 'border-b border-line'}`}
    >
      <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-[10px] bg-accent/15">
        <Icon size={19} className="text-accent" />
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-[15px]">{title}</h2>
        <p className="text-sm text-secondary leading-relaxed max-w-[62ch] mt-0.5">{desc}</p>
      </div>
      <span className="hidden sm:block shrink-0 text-xs font-medium text-muted border border-line rounded-full px-3 py-1 mt-1">
        {meta}
      </span>
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
