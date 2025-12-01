'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Users, ExternalLink, Clock, CheckCircle } from 'lucide-react';

export default function DynamicRedirectPage() {
  const params = useParams();
  const proxyId = params?.proxyId as string;
  
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [experimentInfo, setExperimentInfo] = useState<{
    groupName?: string;
    category?: string;
    treatmentTitle?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (proxyId) {
      fetchRedirectUrl();
    }
  }, [proxyId]);

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
      const response = await fetch(`/api/redirect/${proxyId}`);
      const data = await response.json();
      
      if (response.ok && data.redirectUrl) {
        setRedirectUrl(data.redirectUrl);
        setExperimentInfo({
          groupName: data.groupName,
          category: data.category,
          treatmentTitle: data.treatmentTitle
        });
      } else {
        setError(data.error || 'Redirect URL not configured for this experiment. Please contact the administrator.');
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

  // Determine color scheme based on category
  const getColorScheme = () => {
    if (experimentInfo.category === 'All Male') {
      return {
        gradient: 'from-blue-50 via-background to-indigo-50',
        iconBg: 'from-blue-100 to-indigo-200',
        iconColor: 'text-blue-600',
        progressBar: 'from-blue-600 to-indigo-600',
        buttonBg: 'from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800',
        clockColor: 'text-blue-600',
        spinnerColor: 'border-blue-600'
      };
    } else if (experimentInfo.category === 'All Female') {
      return {
        gradient: 'from-pink-50 via-background to-rose-50',
        iconBg: 'from-pink-100 to-rose-200',
        iconColor: 'text-pink-600',
        progressBar: 'from-pink-600 to-rose-600',
        buttonBg: 'from-pink-600 to-rose-700 hover:from-pink-700 hover:to-rose-800',
        clockColor: 'text-pink-600',
        spinnerColor: 'border-pink-600'
      };
    } else {
      // Mixed or default
      return {
        gradient: 'from-purple-50 via-background to-indigo-50',
        iconBg: 'from-purple-100 to-indigo-200',
        iconColor: 'text-purple-600',
        progressBar: 'from-purple-600 to-indigo-600',
        buttonBg: 'from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800',
        clockColor: 'text-purple-600',
        spinnerColor: 'border-purple-600'
      };
    }
  };

  const colors = getColorScheme();

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${colors.spinnerColor} mx-auto mb-4`}></div>
          <p className="text-gray-600">Loading redirect information...</p>
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
    <div className={`min-h-screen bg-gradient-to-br ${colors.gradient} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${colors.iconBg}`}>
              <Users className={`h-8 w-8 ${colors.iconColor}`} />
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900">
              🎉 Experiment Complete!
            </CardTitle>

            <CardDescription className="text-base text-gray-600">
              Thank you for participating! You will be automatically redirected in a few seconds.
            </CardDescription>

            {experimentInfo.groupName && (
              <div className="text-sm text-gray-500">
                <p><strong>Group:</strong> {experimentInfo.groupName}</p>
                {experimentInfo.category && <p><strong>Category:</strong> {experimentInfo.category}</p>}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Clock className={`h-5 w-5 ${colors.clockColor}`} />
                <span className="text-lg font-semibold text-gray-700">
                  Redirecting in {countdown} seconds...
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <motion.div
                  className={`bg-gradient-to-r ${colors.progressBar} h-2 rounded-full`}
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
              className={`w-full bg-gradient-to-r ${colors.buttonBg}`}
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
