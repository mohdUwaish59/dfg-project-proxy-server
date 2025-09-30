'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import WaitingRoom from '../../../components/WaitingRoom';
import ProxyErrorPage from '../../../components/ProxyErrorPage';

interface ProxyData {
  canJoin?: boolean;
  alreadyJoined?: boolean;
  status?: 'waiting' | 'redirected';
  participantNumber?: number;
  currentWaiting?: number;
  maxParticipants?: number;
  isGroupComplete?: boolean;
  groupSessionId?: string;
  redirectUrl?: string;
  groupName?: string;
  category?: string;
  treatmentTitle?: string;
  error?: string;
  errorType?: 'not_found' | 'full' | 'already_participated' | 'inactive';
}

// Generate a simple browser fingerprint
function generateFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Browser fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

export default function ProxyPage() {
  const params = useParams();
  const proxyId = params?.id as string;
  const [data, setData] = useState<ProxyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fingerprint, setFingerprint] = useState<string>('');

  useEffect(() => {
    if (proxyId) {
      const fp = generateFingerprint();
      setFingerprint(fp);
      joinWaitingRoom(fp);
    }
  }, [proxyId]);

  const joinWaitingRoom = async (fp: string) => {
    try {
      const response = await fetch(`/api/proxy/${proxyId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: fp })
      });

      const result = await response.json();
      
      if (!response.ok) {
        setData({
          error: result.error,
          errorType: response.status === 404 ? 'not_found' : 
                    response.status === 403 ? 'full' : 'inactive'
        });
      } else {
        setData(result);
        
        // If group is complete, redirect after a short delay
        if (result.isGroupComplete && result.redirectUrl) {
          setTimeout(() => {
            window.location.href = result.redirectUrl;
          }, 3000); // 3 second delay to show completion message
        }
      }
    } catch (error) {
      console.error('Error joining waiting room:', error);
      setData({
        error: 'Network error. Please try again.',
        errorType: 'inactive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!fingerprint) return;
    
    try {
      const response = await fetch(`/api/proxy/${proxyId}/status?fingerprint=${fingerprint}`);
      const result = await response.json();
      
      console.log('Status check result:', result); // Debug log
      
      if (response.ok) {
        const newData = {
          ...data,
          currentWaiting: result.current_waiting,
          maxParticipants: result.max_uses,
          isGroupComplete: result.is_full || result.has_redirected_group,
          redirectUrl: result.real_url,
          groupName: result.group_name,
          category: result.category,
          treatmentTitle: result.treatment_title
        };

        // Update user status if available
        if (result.userStatus) {
          newData.status = result.userStatus.status;
          newData.participantNumber = result.userStatus.participantNumber;
          newData.groupSessionId = result.userStatus.groupSessionId;
        }

        setData(newData);
        
        // If group became complete and user is redirected, redirect immediately
        if (result.userStatus && result.userStatus.status === 'redirected' && result.real_url) {
          console.log('Redirecting to:', result.real_url);
          setTimeout(() => {
            window.location.href = result.real_url;
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  // Poll for status updates every 2 seconds if not redirected
  useEffect(() => {
    if (data && data.status !== 'redirected' && !data.isGroupComplete) {
      const interval = setInterval(checkStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [data?.status, data?.isGroupComplete, fingerprint]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experiment...</p>
        </motion.div>
      </div>
    );
  }

  if (data?.error) {
    return <ProxyErrorPage error={data.error} errorType={data.errorType || 'inactive'} />;
  }

  return (
    <WaitingRoom 
      proxyId={proxyId}
      participantNumber={data?.participantNumber || 0}
      currentWaiting={data?.currentWaiting || 0}
      maxParticipants={data?.maxParticipants || 3}
      status={data?.status || 'waiting'}
      isGroupComplete={data?.isGroupComplete || false}
      redirectUrl={data?.redirectUrl}
      groupName={data?.groupName}
      category={data?.category}
      treatmentTitle={data?.treatmentTitle}
    />
  );
}