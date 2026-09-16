'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AccountSettingsFormProps {
  email: string;
  name: string;
}

export function AccountSettingsForm({ email, name: initialName }: AccountSettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      setProfileMessage(error ? error.message : 'Saved.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setPasswordError(error.message);
        return;
      }
      setPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated.');
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="max-w-sm space-y-10">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        <form onSubmit={handleProfileSave} className="space-y-3">
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
          <Button type="submit" size="sm" disabled={profileSaving}>
            {profileSaving ? 'Saving…' : 'Save'}
          </Button>
          {profileMessage ? <p className="text-xs text-muted-foreground">{profileMessage}</p> : null}
        </form>
      </section>

      <section className="space-y-3 border-t border-border pt-8">
        <h2 className="text-sm font-semibold text-foreground">Password</h2>
        <form onSubmit={handlePasswordSave} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="account-new-password">New password</Label>
            <Input
              id="account-new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account-confirm-password">Confirm password</Label>
            <Input
              id="account-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" size="sm" disabled={passwordSaving}>
            {passwordSaving ? 'Saving…' : 'Update password'}
          </Button>
          {passwordError ? <p className="text-xs text-destructive">{passwordError}</p> : null}
          {passwordMessage ? <p className="text-xs text-muted-foreground">{passwordMessage}</p> : null}
        </form>
      </section>
    </div>
  );
}
