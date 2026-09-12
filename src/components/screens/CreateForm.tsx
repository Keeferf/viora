import { useState, type FormEvent, type MouseEvent } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui';

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
    <Card padding="none" className="flex-1 w-full max-w-[420px]">
      <CardHeader>
        <CardTitle>Create New Session</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Your Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError || undefined}
            maxLength={30}
            autoComplete="name"
            autoFocus
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
          <span>Create Session</span>
          <ArrowRight size={18} />
        </Button>
      </CardFooter>
    </Card>
  );
}
