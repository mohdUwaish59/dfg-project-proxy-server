'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from "./ui/skeleton";
import StatsGrid from './StatsGrid';
import CreateLinkForm from './CreateLinkForm';
import LinksTable from './LinksTable';
import RedirectSettings from './RedirectSettings';

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

  useEffect(() => {
    loadData();

    // Set up real-time polling for waiting room updates
    const interval = setInterval(() => {
      loadData();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
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

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} links={links} />
      <CreateLinkForm onLinkCreated={handleLinkCreated} />
      <LinksTable
        links={links}
        onLinkAction={handleLinkAction}
      />
      <RedirectSettings />
    </div>
  );
}