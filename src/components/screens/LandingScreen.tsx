import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor, Users, Zap, Shield, type LucideIcon } from 'lucide-react';
import { JoinForm } from './JoinForm';
import { CreateForm } from './CreateForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardBody } from '@/components/ui';
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
      <main className="min-h-[calc(100vh-56px)] overflow-y-auto flex flex-col items-center px-10 py-8">
        <div className="w-full max-w-[1400px] flex flex-col gap-8 m-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20 mb-3">
              <Monitor size={28} className="text-accent" />
            </div>
            <h1 className="font-display text-4xl tracking-tight mb-2">Viora</h1>
            <p className="text-base text-secondary max-w-[640px] mx-auto">
              High-quality screen sharing for teams. Share your screen, collaborate in real-time,
              zero setup.
            </p>
          </div>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Zap}
              title="Instant Sessions"
              desc="Create or join rooms with a 6-character code. No accounts required."
            />
            <FeatureCard
              icon={Monitor}
              title="Multi-source Sharing"
              desc="Share your entire screen, a specific window, or a browser tab with audio."
            />
            <FeatureCard
              icon={Shield}
              title="Peer-to-Peer"
              desc="Direct WebRTC connections with end-to-end encryption. Your data never touches our servers."
            />
            <FeatureCard
              icon={Users}
              title="Adaptive Quality"
              desc="Automatic bitrate adjustment for smooth streaming on any connection."
            />
          </div>

          <div className="flex gap-6 items-stretch justify-center">
            <div className="flex-1 flex flex-col max-w-[420px] w-full">
              <div className="flex gap-2 mb-3 border-b border-line pb-2">
                <div className="flex-1">
                  <Button
                    variant={activeTab === 'join' ? 'primary' : 'ghost'}
                    fullWidth
                    onClick={() => setActiveTab('join')}
                  >
                    Join Session
                  </Button>
                </div>
                <div className="flex-1">
                  <Button
                    variant={activeTab === 'create' ? 'primary' : 'ghost'}
                    fullWidth
                    onClick={() => setActiveTab('create')}
                  >
                    Create Session
                  </Button>
                </div>
              </div>
              {activeTab === 'join' ? (
                <JoinForm onJoin={handleJoin} isLoading={isLoading} error={error ?? undefined} />
              ) : (
                <CreateForm
                  onCreate={handleCreate}
                  isLoading={isLoading}
                  error={error ?? undefined}
                />
              )}
              <p className="text-center text-xs text-muted mt-4">
                By using Viora, you agree to our <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <Card padding="none" className="flex flex-col h-full">
      <CardBody className="flex-1 flex flex-col p-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20 mb-3">
          <Icon size={20} className="text-accent" />
        </div>
        <h3 className="text-base font-semibold mb-1">{title}</h3>
        <p className="text-sm text-secondary leading-snug flex-1">{desc}</p>
      </CardBody>
    </Card>
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
