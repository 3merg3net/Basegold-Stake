'use client';

import { useEffect, useState } from 'react';
import StakeForm from '@/components/StakeForm';
import PositionsPanel from '@/components/PositionsPanel';


export default function StakePage() {
  const [fatal, setFatal] = useState<string | null>(null);

  useEffect(() => {
    const onErr = (ev: ErrorEvent) => {
      setFatal(ev?.error?.message || ev?.message || 'Unhandled error');
    };
    const onRej = (ev: PromiseRejectionEvent) => {
      const r: any = ev?.reason;
      const msg =
        r?.metaMessages?.join('\n') ||
        r?.cause?.data?.message ||
        r?.cause?.shortMessage ||
        r?.cause?.message ||
        r?.shortMessage ||
        r?.message ||
        String(r);
      setFatal(msg);
    };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);

  return (
    <div className="space-y-6">
      {fatal && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm whitespace-pre-wrap">
          {fatal}
        </div>
      )}
      <StakeForm initialLockDays={14} />
      <PositionsPanel />
      
    </div>
  );
}
