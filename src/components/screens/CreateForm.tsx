import { useState, type FormEvent, type MouseEvent } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface CreateFormProps {
  onCreate: (name: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function CreateForm({ onCreate, isLoading, error }: CreateFormProps) {
  const [name, setName] = useState(() => localStorage.getItem('viora-display-name') || '');
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: FormEvent | MouseEvent) => {
    e.preventDefault();
    setNameError('');

    const cleanName = name.trim();

    if (!cleanName) {
      setNameError('Enter your name');
      return;
    }
    if (cleanName.length > 30) {
      setNameError('Name too long (max 30 chars)');
      return;
    }

    localStorage.setItem('viora-display-name', cleanName);
    onCreate(cleanName);
  };

  return (
    <div className="w-full">
      <h2 className="font-display uppercase tracking-wide text-lg">Create a session</h2>
      <p className="text-[13px] text-secondary mt-1 mb-4">
        You will get a six-character code to pass around.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Your name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError || undefined}
          maxLength={30}
          autoComplete="name"
          autoFocus
          disabled={isLoading}
        />
        {error && (
          <div className="flex items-center gap-2 px-3.5 py-3 bg-danger/10 border border-danger/40 rounded-[10px] text-danger text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" fullWidth size="lg" loading={isLoading} onClick={handleSubmit}>
          <span>Create session</span>
          <ArrowRight size={18} />
        </Button>
      </form>
    </div>
  );
}
