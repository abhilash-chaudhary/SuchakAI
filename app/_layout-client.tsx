'use client';

import { useEffect, useState, ReactNode } from 'react';
import { UserProfile } from '@/lib/types';
import { ChatbotWidget } from '@/components/ChatbotWidget';

const DEFAULT_GUEST_PROFILE: UserProfile = {
  name: 'Citizen',
  age: 24,
  gender: 'all',
  state: 'Maharashtra',
  category: 'General',
  occupation: 'job_seeker',
  education: 'undergraduate',
  annualIncome: 250000,
  isRural: false,
  hasDisability: false,
  interests: ['Employment', 'Education', 'Skill Training']
};

export function LayoutClient({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_GUEST_PROFILE);

  useEffect(() => {
    const syncProfile = () => {
      const stored = localStorage.getItem('soochai_profile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setProfile(parsed);
          }
        } catch {
          // Ignore parse errors
        }
      }
    };

    syncProfile();
    window.addEventListener('storage', syncProfile);
    window.addEventListener('focus', syncProfile);
    return () => {
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('focus', syncProfile);
    };
  }, []);

  return (
    <body className="min-h-full flex flex-col">
      {children}
      <ChatbotWidget currentProfile={profile} />
    </body>
  );
}
