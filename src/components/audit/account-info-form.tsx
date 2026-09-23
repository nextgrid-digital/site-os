'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AccountInfoFormProps {
  email: string;
  name: string;
}

export function AccountInfoForm({ email, name: initialName }: AccountInfoFormProps) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      setMessage(error ? error.message : 'Saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-sm space-y-6">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="account-name">Name</Label>
          <Input
            id="account-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />
        </div>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      </form>
    </div>
  );
}
