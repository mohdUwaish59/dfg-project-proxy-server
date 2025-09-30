'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ProxyJoinPage from '../../../components/ProxyJoinPage';
import ProxyErrorPage from '../../../components/ProxyErrorPage';

interface Link {
  proxy_id: string;
  group_name: string;
  real_url: string;
  current_uses: number;
  max_uses: number;
  is_active: boolean;
  created_at: string;
}

interface Usage {
  participant_number: number;
  used_at: string;
}

interface ProxyData {
  success: boolean;
  link?: Link;
  usage?: Usage;
  remainingSpots?: number;
  error?: string;
  errorType?: 'not_found' | 'full' | 'already_participated' | 'inactive';
}

export default function ProxyPage() {
  const params = useParams();
  const proxyId = params?.id as string;
  const [data, setData] = useState<ProxyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (proxyId) {
      checkProxyStatus();
    }
  }, [proxyId]);

  const checkProxyStatus = async () => {
    try {
      // Generate browser fingerprint
      const fingerprint = generateFingerprint();
      
      const response = await fetch(`/api/proxy/${proxyId}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint })
      });

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error checking proxy status:', error);
      setData({
        success: false,
        error: 'Network error. Please try again.',
        errorType: 'not_found'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
    }
    
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.platform
    ];
    
    // Simple hash function
    let hash = 0;
    const str = components.join('|');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading experiment...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <ProxyErrorPage 
        error={data?.error || 'Unknown error'}
        errorType={data?.errorType || 'not_found'}
        link={data?.link}
        usage={data?.usage}
      />
    );
  }

  return (
    <ProxyJoinPage 
      link={data.link!}
      remainingSpots={data.remainingSpots!}
      proxyId={proxyId}
      onJoinSuccess={checkProxyStatus}
    />
  );
}