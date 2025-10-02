'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface WaitingRoomProps {
  proxyId: string;
  participantNumber: number;
  currentWaiting: number;
  maxParticipants: number;
  status: 'waiting' | 'redirected';
  isGroupComplete: boolean;
  redirectUrl?: string;
  groupName?: string;
  category?: string;
  treatmentTitle?: string;
}

export default function WaitingRoom({
  proxyId,
  participantNumber,
  currentWaiting,
  maxParticipants,
  status,
  isGroupComplete,
  redirectUrl,
  groupName,
  category,
  treatmentTitle
}: WaitingRoomProps) {
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

  const progressPercentage = (currentWaiting / maxParticipants) * 100;

  // Debug logging
  console.log('WaitingRoom props:', {
    proxyId,
    participantNumber,
    currentWaiting,
    maxParticipants,
    status,
    isGroupComplete,
    redirectUrl
  });

  // Start countdown when group is complete
  useEffect(() => {
    if (isGroupComplete && status === 'redirected') {
      setShowCountdown(true);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (redirectUrl) {
              window.location.href = redirectUrl;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isGroupComplete, status, redirectUrl]);

  const getStatusMessage = () => {
    if (isGroupComplete) {
      return "All participants ready! Redirecting to experiment...";
    }

    const remaining = maxParticipants - currentWaiting;
    if (remaining === 1) {
      return "Waiting for 1 more participant to join...";
    }
    return `Waiting for ${remaining} more participants to join...`;
  };

  const getStatusColor = () => {
    if (isGroupComplete) return "success";
    if (currentWaiting >= maxParticipants * 0.66) return "warning";
    return "primary";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-accent-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-accent-600"
            >
              {isGroupComplete ? (
                <CheckCircle className="h-8 w-8 text-white" />
              ) : (
                <Users className="h-8 w-8 text-white" />
              )}
            </motion.div>

            <CardTitle className="text-2xl font-bold text-gray-900">
              {isGroupComplete ? "Group Complete!" : "Experiment Waiting Room"}
            </CardTitle>

            <CardDescription className="text-gray-600 text-lg">
              {getStatusMessage()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Participant Info */}
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="outline" className="px-4 py-2 text-lg">
                You are Participant #{participantNumber}
              </Badge>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Participants Joined
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {currentWaiting} / {maxParticipants}
                </span>
              </div>

              <Progress
                value={progressPercentage}
                className="h-3"
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>Waiting for participants...</span>
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
            </div>

            {/* Participant Slots Visualization */}
            <div className="flex justify-center space-x-4">
              {Array.from({ length: maxParticipants }, (_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={`
                    w-16 h-16 rounded-full border-2 flex items-center justify-center
                    ${index < currentWaiting
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {index < currentWaiting ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Users className="h-6 w-6" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {!isGroupComplete ? (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="flex items-center justify-center space-x-2 text-primary-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">
                      Please wait while other participants join...
                    </span>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>This page will automatically update</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">All participants have joined!</span>
                    </div>

                    {showCountdown && (
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <ArrowRight className="h-4 w-4" />
                        <span>Redirecting in {countdown} seconds...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Please keep this page open and wait for other participants</li>
                <li>• Do not refresh or close this page</li>
                <li>• You will be automatically redirected when everyone has joined</li>
                <li>• The experiment will begin once all {maxParticipants} participants are ready</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}