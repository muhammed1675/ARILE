import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getMyProfile } from '../../lib/api';
import { Button } from '../ui/Button';

const inputClass =
'w-full border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-subtle ' +
'transition-colors duration-200 focus:border-accent focus:outline-none';

const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

export function ProfileTab() {
  const { user, updateProfile, changePassword } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMyProfile(user.id).then((res) => {
      if (res.ok && res.data) {
        setFullName(res.data.fullName || (user.user_metadata?.full_name as string) || '');
        setPhone(res.data.phone);
      }
      setLoaded(true);
    });
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PHONE_PATTERN.test(phone.trim())) {
      toast.error('Enter a valid phone number — digits only, 7 to 15 of them.');
      return;
    }
    setSavingProfile(true);
    const result = await updateProfile(fullName.trim(), phone.trim());
    setSavingProfile(false);
    if (result.error) toast.error(result.error);else
    toast.success('Profile updated.');
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setSavingPassword(true);
    const result = await changePassword(newPassword);
    setSavingPassword(false);
    if (result.error) toast.error(result.error);else
    {
      toast.success('Password updated.');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="max-w-lg space-y-14">
      {!loaded &&
      <div className="space-y-3">
          <div className="h-11 w-full animate-pulse bg-surface-2" />
          <div className="h-11 w-full animate-pulse bg-surface-2" />
        </div>
      }
      <form onSubmit={saveProfile} className={`space-y-5 ${!loaded ? 'hidden' : ''}`}>
        <h2 className="font-serif text-xl">Your details</h2>

        <div>
          <label htmlFor="p-name" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            Full name
          </label>
          <input
            id="p-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            autoComplete="name" />
          
        </div>

        <div>
          <label htmlFor="p-email" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            Email
          </label>
          <input
            id="p-email"
            value={user?.email ?? ''}
            disabled
            className={`${inputClass} cursor-not-allowed opacity-60`} />
          
          <p className="mt-2 text-[11px] font-light text-subtle">
            Contact us if you need to change the email on your account.
          </p>
        </div>

        <div>
          <label htmlFor="p-phone" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            Phone number
          </label>
          <input
            id="p-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+234 800 000 0000"
            autoComplete="tel" />
          
        </div>

        <Button type="submit" disabled={savingProfile}>
          {savingProfile ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <form onSubmit={savePassword} className="space-y-5 border-t border-line pt-10">
        <h2 className="font-serif text-xl">Change password</h2>

        <div>
          <label htmlFor="p-new-pw" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            New password
          </label>
          <input
            id="p-new-pw"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password" />
          
        </div>

        <div>
          <label htmlFor="p-confirm-pw" className="mb-2 block text-[10px] uppercase tracking-widest text-subtle">
            Confirm new password
          </label>
          <input
            id="p-confirm-pw"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password" />
          
        </div>

        <Button type="submit" variant="outline" disabled={savingPassword}>
          {savingPassword ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>);

}
