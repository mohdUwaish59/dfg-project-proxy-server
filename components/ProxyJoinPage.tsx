'use client';

import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { useToast } from '../contexts/ToastContext';
import { 
  Beaker, 
  Users, 
  Play,
  AlertTriangle,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface Link {
  proxy_id: string;
  group_name: string;
  real_url: string;
  current_uses: number;
  max_uses: number;
  is_active: boolean;
  created_at: string;
}

interface ProxyJoinPageProps {
  link: Link;
  remainingSpots: number;
  proxyId: string;
  onJoinSuccess: () => void;
}

export default function ProxyJoinPage({ link, remainingSpots, proxyId, onJoinSuccess }: ProxyJoinPageProps) {
  const [isJoining, setIsJoining] = useState(false);
  const { showToast } = useToast();

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

  const joinExperiment = async () => {
    setIsJoining(true);
    
    try {
      const fingerprint = generateFingerprint();
      
      const response = await fetch(`/api/proxy/${proxyId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint })
      });

      const data = await response.json();

      if (data.success) {
        // Store fingerprint to prevent re-participation
        const cookieName = `study_group_${proxyId}_fp`;
        const localStorageKey = `study_access_${proxyId}`;
        
        // Set cookie (expires in 30 days)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        document.cookie = `${cookieName}=${fingerprint}; expires=${expiryDate.toUTCString()}; path=/`;
        
        // Set localStorage
        localStorage.setItem(localStorageKey, fingerprint);
        
        showToast('success', 'Success!', 'Successfully joined! Opening experiment...');
        
        // Open the experiment in a new tab
        window.open(link.real_url, '_blank');
        
        // Refresh the page state
        setTimeout(() => {
          onJoinSuccess();
        }, 1000);
      } else {
        throw new Error(data.error || 'Failed to join experiment');
      }
    } catch (error) {
      console.error('Error joining experiment:', error);
      showToast('error', 'Error', 'Failed to join experiment. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-accent-600">
              <Beaker className="h-8 w-8 text-white" />
            </div>
            
            <Badge variant="outline" className="mx-auto px-4 py-2 border-primary-200 bg-primary-50 text-primary-700">
              <Users className="mr-2 h-4 w-4" />
              {link.group_name || 'Experiment Group'}
            </Badge>
            
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome to the Research Experiment
            </CardTitle>
            
            <CardDescription className="text-lg text-gray-600">
              Click the button below to join your assigned experiment session
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 bg-gradient-to-br from-success-50 to-success-100">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-success-600 mb-2">
                    {remainingSpots}
                  </div>
                  <div className="text-sm text-success-700/70">
                    Spots Remaining
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-primary-50 to-primary-100">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {link.max_uses}
                  </div>
                  <div className="text-sm text-primary-700/70">
                    Total Participants
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Button
              onClick={joinExperiment}
              disabled={isJoining}
              size="lg"
              className="w-full h-14 text-lg bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Join Experiment
                </>
              )}
            </Button>
            
            <Alert className="border-warning-200 bg-warning-50">
              <AlertTriangle className="h-4 w-4 text-warning-600" />
              <AlertDescription className="text-warning-800">
                <strong>Important:</strong> You can only join once. {remainingSpots} spots remaining in this group.
                The experiment will open in a new tab.
              </AlertDescription>
            </Alert>
            
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-0">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-primary-600" />
                  <span className="font-mono break-all">
                    Destination: {link.real_url}
                  </span>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}