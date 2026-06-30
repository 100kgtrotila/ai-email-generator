'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers';
import { toast } from 'sonner';

export function UpgradeButton() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  function handleClick() {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsPending(true);
    // No real payment processor wired up for this MVP — show a clear,
    // honest flow instead of a dead link or fake checkout.
    toast.info('Upgrade flow coming soon', {
      description: 'Stripe billing integration is planned for a future release.',
    });
    setIsPending(false);
  }

  return (
    <Button
      className="relative z-10 w-full bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg"
      onClick={handleClick}
      disabled={loading || isPending}
    >
      Upgrade to Pro
    </Button>
  );
}
