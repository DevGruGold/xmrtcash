import React from 'react';
import MochaHeader from '@/components/MochaHeader';
import MochaSidebar from '@/components/MochaSidebar';
import MeshNetworkDashboard from '@/components/meshnet/MeshNetworkDashboard';

const MeshnetPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <MochaHeader />
      <div className="flex">
        <MochaSidebar />
        <main className="flex-1 p-6 ml-64">
          <MeshNetworkDashboard />
        </main>
      </div>
    </div>
  );
};

export default MeshnetPage;