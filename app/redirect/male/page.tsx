'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Users, ExternalLink, Clock, CheckCircle } from 'lucide-react';

export default function MaleRedirectPage() {
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchRedirectUrl();
  }, []);

  useEffect(() => {
    if (redirectUrl && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectUrl && countdown === 0) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl, countdown]);

  const fetchRedirectUrl = async () => {
    try {
      const response = await fetch('/api/admin/redirect-settings');
      const data = await response.json();
      
      if (response.ok && data.maleRedirectUrl) {
        setRedirectUrl(data.maleRedirectUrl);
      } else {
        setError('Male redirect URL not configured. Please contact the administrator.');
      }
    } catch (error) {
      console.error('Error fetching redirect URL:', error);
      setError('Failed to load redirect configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to Prolific...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Configuration Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-200">
              <Users className="h-8 w-8 text-blue-600" />
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900">
              🎉 Experiment Complete!
            </CardTitle>

            <CardDescription className="text-base text-gray-600">
              Thank you for participating! You will be automatically redirected to Prolific in a few seconds.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold text-gray-700">
                  Redirecting in {countdown} seconds...
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(countdown / 5) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Experiment data saved successfully</span>
              </div>
            </div>

            <Button 
              onClick={handleManualRedirect}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800" 
              size="lg"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Continue Now
            </Button>

            <p className="text-xs text-center text-gray-500">
              If you are not redirected automatically, please click the button above.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}