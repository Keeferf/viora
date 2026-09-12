import { useState, type FormEvent, type MouseEvent } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui';

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
    <Card padding="none" className="flex-1 w-full max-w-[420px]">
      <CardHeader>
        <CardTitle>Join a Session</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Room Code"
            placeholder="A7K9M2"
            value={roomCode}
            onChange={handleCodeChange}
            error={codeError || error || undefined}
            maxLength={6}
            autoComplete="off"
            spellCheck={false}
            autoFocus
            disabled={isLoading}
          />
          <Input
            label="Your Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError || undefined}
            maxLength={30}
            autoComplete="name"
            disabled={isLoading}
          />
          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger rounded-[10px] text-danger text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </CardBody>
      <CardFooter>
        <Button type="button" fullWidth loading={isLoading} onClick={handleSubmit}>
          <span>Join Session</span>
          <ArrowRight size={18} />
        </Button>
      </CardFooter>
    </Card>
  );
}
