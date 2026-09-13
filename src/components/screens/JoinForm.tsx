import { useState, type FormEvent, type MouseEvent } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface JoinFormProps {
  onJoin: (roomCode: string, name: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function JoinForm({ onJoin, isLoading, error }: JoinFormProps) {
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState(() => localStorage.getItem('viora-display-name') || '');
  const [nameError, setNameError] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleSubmit = (e: FormEvent | MouseEvent) => {
    e.preventDefault();
    setNameError('');
    setCodeError('');

    const cleanCode = roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanName = name.trim();

    if (!cleanCode) {
      setCodeError('Enter a room code');
      return;
    }
    if (cleanCode.length !== 6) {
      setCodeError('Room code must be 6 characters');
      return;
    }
    if (!cleanName) {
      setNameError('Enter your name');
      return;
    }
    if (cleanName.length > 30) {
      setNameError('Name too long (max 30 chars)');
      return;
    }

    localStorage.setItem('viora-display-name', cleanName);
    onJoin(cleanCode, cleanName);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRoomCode(value);
  };

  return (
    <div className="w-full">
      <h2 className="font-display uppercase tracking-wide text-lg">Join a session</h2>
      <p className="text-[13px] text-secondary mt-1 mb-4">
        Ask your host for the six-character code.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Room code"
          placeholder="A7K9M2"
          value={roomCode}
          onChange={handleCodeChange}
          error={codeError || error || undefined}
          maxLength={6}
          autoComplete="off"
          spellCheck={false}
          autoFocus
          disabled={isLoading}
          className="room-code-type text-center text-lg font-bold uppercase"
        />
        <Input
          label="Your name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError || undefined}
          maxLength={30}
          autoComplete="name"
          disabled={isLoading}
        />
        {error && (
          <div className="flex items-center gap-2 px-3.5 py-3 bg-danger/10 border border-danger/40 rounded-[10px] text-danger text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" fullWidth size="lg" loading={isLoading} onClick={handleSubmit}>
          <span>Join session</span>
          <ArrowRight size={18} />
        </Button>
      </form>
    </div>
  );
}
