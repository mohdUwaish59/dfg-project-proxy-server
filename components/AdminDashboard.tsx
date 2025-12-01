'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "./ui/skeleton";
import StatsGrid from './StatsGrid';
import CreateLinkForm from './CreateLinkForm';
import LinksTable from './LinksTable';
import RedirectSettings from './RedirectSettings';
import WaitingRoomMonitor from './WaitingRoomMonitor';

interface Link {
  proxy_id: string;
  group_name: string;
  real_url: string;
  category?: string;
  treatment_title?: string;
  current_uses: number;
  max_uses: number;
  is_active: boolean;
  status?: string;
  completed_at?: string;
  created_at: string;
  waiting_count?: number;
  waiting_participants?: Array<{
    participant_number: number;
    joined_at: string;
  }>;
}

interface Stats {
  total: number;
  active: number;
  participants: number;
  full: number;
  used?: number;
}

export default function AdminDashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, participants: 0, full: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [linksResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/links', { credentials: 'include' }),
        fetch('/api/admin/stats', { credentials: 'include' })
      ]);

      if (linksResponse.ok && statsResponse.ok) {
        const linksData = await linksResponse.json();
        const statsData = await statsResponse.json();

        setLinks(linksData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkCreated = () => {
    loadData(); // Refresh data after creating a new link
  };

  const handleLinkAction = () => {
    loadData(); // Refresh data after any link action
  };

  const handleViewRoom = (proxyId: string) => {
    setSelectedRoomId(proxyId);
  };

  const handleBackToDashboard = () => {
    setSelectedRoomId(null);
    loadData(); // Refresh data when returning
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Show waiting room monitor if a room is selected
  if (selectedRoomId) {
    return (
      <WaitingRoomMonitor 
        proxyId={selectedRoomId} 
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <StatsGrid stats={stats} links={links} />
      <CreateLinkForm onLinkCreated={handleLinkCreated} />
      <LinksTable
        links={links}
        onLinkAction={handleLinkAction}
        onViewRoom={handleViewRoom}
      />
      <RedirectSettings />
    </div>
  );
}