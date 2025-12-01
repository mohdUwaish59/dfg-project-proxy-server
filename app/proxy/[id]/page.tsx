'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import WaitingRoom from '../../../components/WaitingRoom';
import ProxyErrorPage from '../../../components/ProxyErrorPage';
import GenderCollectionForm from '../../../components/GenderCollectionForm';

interface ProxyData {
  canJoin?: boolean;
  alreadyJoined?: boolean;
  status?: 'waiting' | 'redirected' | 'expired';
  participantNumber?: number;
  currentWaiting?: number;
  maxParticipants?: number;
  isGroupComplete?: boolean;
  groupSessionId?: string;
  redirectUrl?: string;
  groupName?: string;
  category?: string;
  treatmentTitle?: string;
  participantTimerStart?: number;
  participantTimerExpired?: boolean;
  participantTimeLeft?: number;
  error?: string;
  errorType?: 'not_found' | 'full' | 'already_participated' | 'inactive' | 'already_joined';
  participantGender?: string;
  joinedAt?: string;
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
  const [gender, setGender] = useState<string | null>(null);
  const [prolificPid, setProlificPid] = useState<string | null>(null);
  const [showGenderForm, setShowGenderForm] = useState(false);
  const [linkInfo, setLinkInfo] = useState<{ groupName?: string; category?: string } | null>(null);

  useEffect(() => {
    if (proxyId) {
      // Extract URL parameters (from Prolific)
      const urlParams = new URLSearchParams(window.location.search);
      const genderParam = urlParams.get('gender') || urlParams.get('GENDER');
      const pidParam = urlParams.get('PROLIFIC_PID') || urlParams.get('prolific_pid');
      
      console.log('🔍 URL Parameters:', { gender: genderParam, prolific_pid: pidParam });
      
      setProlificPid(pidParam);
      
      const fp = generateFingerprint();
      setFingerprint(fp);
      
      // If gender is provided in URL, use it directly
      if (genderParam) {
        setGender(genderParam);
        joinWaitingRoom(fp, genderParam, pidParam);
      } else {
        // No gender in URL - need to show form
        // First, fetch link info to know the category
        fetchLinkInfo(fp, pidParam);
      }
    }
  }, [proxyId]);

  const fetchLinkInfo = async (fp: string, pidParam: string | null) => {
    try {
      // Try to join without gender to get link info
      const response = await fetch(`/api/proxy/${proxyId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fingerprint: fp,
          gender: null,
          prolific_pid: pidParam
        })
      });

      const result = await response.json();
      
      if (!response.ok && result.missingParameter === 'gender') {
        // Gender is required - show form
        setLinkInfo({
          groupName: result.groupName,
          category: result.category
        });
        setShowGenderForm(true);
        setIsLoading(false);
      } else if (response.ok) {
        // No gender required or already joined
        setData(result);
        setIsLoading(false);
      } else {
        // Other error
        let errorType: 'not_found' | 'full' | 'already_participated' | 'inactive' | 'already_joined' = 'inactive';
        
        if (response.status === 404) {
          errorType = 'not_found';
        } else if (response.status === 403) {
          if (result.errorType === 'already_joined') {
            errorType = 'already_joined';
          } else if (result.error?.includes('full')) {
            errorType = 'full';
          }
        }
        
        setData({
          error: result.error,
          errorType: errorType,
          participantNumber: result.participantNumber,
          joinedAt: result.joinedAt
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching link info:', error);
      setData({
        error: 'Network error. Please try again.',
        errorType: 'inactive'
      });
      setIsLoading(false);
    }
  };

  const handleGenderSubmit = (selectedGender: string) => {
    setGender(selectedGender);
    setShowGenderForm(false);
    setIsLoading(true);
    joinWaitingRoom(fingerprint, selectedGender, prolificPid);
  };

  const joinWaitingRoom = async (fp: string, genderParam: string | null, pidParam: string | null) => {
    try {
      const response = await fetch(`/api/proxy/${proxyId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fingerprint: fp,
          gender: genderParam,
          prolific_pid: pidParam
        })
      });

      const result = await response.json();
      
      console.log('Join response:', { status: response.status, result });
      
      if (!response.ok) {
        // Determine error type from response
        let errorType: 'not_found' | 'full' | 'already_participated' | 'inactive' | 'already_joined' = 'inactive';
        
        if (response.status === 404) {
          errorType = 'not_found';
        } else if (response.status === 400) {
          // Bad request - likely missing gender parameter
          errorType = 'inactive';
        } else if (response.status === 403) {
          // Check error type
          if (result.errorType === 'already_joined') {
            errorType = 'already_joined';
          } else if (result.error?.includes('full') || result.errorType === 'full') {
            errorType = 'full';
          } else {
            errorType = 'inactive';
          }
        }
        
        console.error('❌ Join failed:', result.error);
        
        setData({
          error: result.error || 'Unable to join experiment',
          errorType: errorType,
          participantNumber: result.participantNumber,
          joinedAt: result.joinedAt
        });
      } else {
        setData(result);
        
        // Check if participant is redirected (in a formed group)
        const isRedirected = result.status === 'redirected' || result.isGroupComplete;
        
        if (isRedirected && result.redirectUrl) {
          console.log('🚀 GROUP FORMED! Redirecting immediately...');
          console.log('Status:', result.status);
          console.log('Redirect URL:', result.redirectUrl);
          
          // Show brief success message then redirect
          setTimeout(() => {
            window.location.href = result.redirectUrl;
          }, 1500); // 1.5 second delay to show success
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
    if (!fingerprint && !prolificPid) return;
    
    try {
      // TESTING MODE: Pass prolific_pid for unique identification
      const params = new URLSearchParams();
      if (prolificPid) {
        params.append('prolific_pid', prolificPid);
      }
      if (fingerprint) {
        params.append('fingerprint', fingerprint);
      }
      
      const response = await fetch(`/api/proxy/${proxyId}/status?${params.toString()}`);
      const result = await response.json();
      
      console.log('========== STATUS CHECK ==========');
      console.log('Prolific PID:', prolificPid);
      console.log('Full result:', JSON.stringify(result, null, 2));
      console.log('result.status:', result.status);
      console.log('result.userStatus:', result.userStatus);
      console.log('result.userStatus?.status:', result.userStatus?.status);
      console.log('result.real_url:', result.real_url);
      console.log('==================================');
      
      if (response.ok) {
        // Check if THIS participant is redirected (not just if any group exists)
        const thisParticipantRedirected = result.userStatus?.status === 'redirected';
        
        const newData = {
          ...data,
          currentWaiting: result.current_waiting,
          maxParticipants: result.max_uses,
          isGroupComplete: thisParticipantRedirected, // Only true if THIS participant is redirected
          redirectUrl: result.real_url,
          groupName: result.group_name,
          category: result.category,
          treatmentTitle: result.treatment_title,
          participantTimerStart: result.participantTimerStart,
          participantTimerExpired: result.participantTimerExpired,
          participantTimeLeft: result.participantTimeLeft,
          status: result.participantTimerExpired ? 'expired' : (result.status || data?.status || 'waiting')
        };

        // Update user status if available
        if (result.userStatus) {
          newData.status = result.userStatus.status;
          newData.participantNumber = result.userStatus.participantNumber;
          newData.groupSessionId = result.userStatus.groupSessionId;
          newData.participantTimerStart = result.userStatus.participantTimerStart;
          newData.participantTimeLeft = result.userStatus.participantTimeLeft;
          newData.participantTimerExpired = result.userStatus.participantTimerExpired;
        }
        
        console.log('💡 isGroupComplete set to:', newData.isGroupComplete, '(based on userStatus.status:', result.userStatus?.status, ')');

        setData(newData);
        
        // Check if user is redirected - CRITICAL for group formation
        const isRedirected = result.userStatus?.status === 'redirected' || 
                            newData.status === 'redirected' ||
                            result.status === 'redirected';
        
        console.log('🔍 Redirect check:');
        console.log('  - result.userStatus?.status:', result.userStatus?.status);
        console.log('  - newData.status:', newData.status);
        console.log('  - result.status:', result.status);
        console.log('  - isRedirected:', isRedirected);
        console.log('  - result.real_url:', result.real_url);
        
        if (isRedirected && result.real_url) {
          console.log('🚀🚀🚀 REDIRECTING NOW! 🚀🚀🚀');
          console.log('Redirect URL:', result.real_url);
          console.log('User Status:', result.userStatus);
          
          // Redirect immediately (no delay for waiting participants)
          window.location.href = result.real_url;
        } else {
          console.log('❌ NOT redirecting - isRedirected:', isRedirected, 'real_url:', result.real_url);
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  // Poll for status updates every 2 seconds if not redirected
  useEffect(() => {
    if (data && data.status !== 'redirected' && !data.isGroupComplete) {
      console.log('📡 Starting polling... Current status:', data.status, 'Prolific PID:', prolificPid);
      const interval = setInterval(() => {
        console.log('⏰ Polling tick - checking status for:', prolificPid);
        checkStatus();
      }, 2000);
      return () => {
        console.log('🛑 Stopping poll for:', prolificPid);
        clearInterval(interval);
      };
    } else if (data?.status === 'redirected') {
      console.log('✅ Status is redirected - stopping poll for:', prolificPid);
    }
  }, [data?.status, data?.isGroupComplete, fingerprint, prolificPid]);

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

  if (showGenderForm) {
    return (
      <GenderCollectionForm
        groupName={linkInfo?.groupName}
        category={linkInfo?.category}
        prolificPid={prolificPid || undefined}
        onSubmit={handleGenderSubmit}
      />
    );
  }

  if (data?.error) {
    return (
      <ProxyErrorPage 
        error={data.error} 
        errorType={data.errorType || 'inactive'}
        participantNumber={data.participantNumber}
        joinedAt={data.joinedAt}
      />
    );
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
      participantTimerStart={data?.participantTimerStart}
      participantGender={gender || undefined}
    />
  );
}