import React from 'react';
import MochaSidebar from '@/components/MochaSidebar';
import MochaHeader from '@/components/MochaHeader';
import { XMRTFaucet } from '@/components/xmrt/XMRTFaucet';

// XMRT Faucet Page - Get free testnet tokens
export default function FaucetPage() {
  return (
    <div className="min-h-screen bg-background flex">
      <MochaSidebar />
      <div className="flex-1 flex flex-col">
        <MochaHeader />
        <main className="flex-1 p-6">
          <XMRTFaucet />
        </main>
      </div>
    </div>
  );
}