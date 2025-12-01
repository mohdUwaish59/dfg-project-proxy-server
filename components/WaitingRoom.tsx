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
  Loader2,
  AlertCircle
} from 'lucide-react';

interface WaitingRoomProps {
  proxyId: string;
  participantNumber: number;
  currentWaiting: number;
  maxParticipants: number;
  status: 'waiting' | 'redirected' | 'expired';
  isGroupComplete: boolean;
  redirectUrl?: string;
  groupName?: string;
  category?: string;
  treatmentTitle?: string;
  participantTimerStart?: number; // Timestamp when this participant joined
  participantGender?: string; // Participant's gender
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
  treatmentTitle,
  participantTimerStart,
  participantGender
}: WaitingRoomProps) {
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [participantTimeLeft, setParticipantTimeLeft] = useState(600); // 10 minutes in seconds
  const [participantTimerExpired, setParticipantTimerExpired] = useState(false);

  const progressPercentage = (currentWaiting / maxParticipants) * 100;

  // Debug logging
  console.log('WaitingRoom props:', {
    proxyId,
    participantNumber,
    currentWaiting,
    maxParticipants,
    status,
    isGroupComplete,
    redirectUrl,
    participantTimerStart,
    participantTimeLeft,
    participantTimerExpired
  });

  // Participant timer effect - runs when participantTimerStart is provided
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    // Start timer if backend provides participantTimerStart
    if (participantTimerStart && !isGroupComplete && status !== 'expired') {
      console.log('Starting participant timer - participantTimerStart:', participantTimerStart);

      // Use backend-provided start time for accurate synchronization
      const now = Date.now();
      const elapsed = Math.floor((now - participantTimerStart) / 1000);
      const initialTimeLeft = Math.max(0, 600 - elapsed);
      setParticipantTimeLeft(initialTimeLeft);

      if (initialTimeLeft > 0) {
        timer = setInterval(() => {
          const currentTime = Date.now();
          const totalElapsed = Math.floor((currentTime - participantTimerStart) / 1000);
          const timeLeft = Math.max(0, 600 - totalElapsed); // 10 minutes = 600 seconds

          console.log('Participant timer update - elapsed:', totalElapsed, 'timeLeft:', timeLeft);
          setParticipantTimeLeft(timeLeft);

          if (timeLeft <= 0) {
            setParticipantTimerExpired(true);
            if (timer) clearInterval(timer);
          }
        }, 1000);
      } else {
        setParticipantTimerExpired(true);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [participantTimerStart, isGroupComplete, status]);

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    if (participantTimerExpired || status === 'expired') {
      return "Your waiting time has expired. You did not get matched with a group in time.";
    }

    if (isGroupComplete) {
      return "Your group is complete! Redirecting to experiment...";
    }

    // For pool-based system, show waiting for group formation
    const groupSize = 3; // Fixed group size
    const neededForGroup = groupSize - (currentWaiting % groupSize || groupSize);
    
    // Gender-specific messages
    if (category === 'All Male') {
      if (neededForGroup === 1) {
        return "Waiting for 1 more male participant to form a group...";
      }
      return `Waiting for ${neededForGroup} more male participants to form a group...`;
    }
    
    if (category === 'All Female') {
      if (neededForGroup === 1) {
        return "Waiting for 1 more female participant to form a group...";
      }
      return `Waiting for ${neededForGroup} more female participants to form a group...`;
    }
    
    if (category === 'Mixed') {
      return "Waiting for participants to form a mixed-gender group...";
    }
    
    // Default message
    if (neededForGroup === 1) {
      return "Waiting for 1 more participant to form a group...";
    }
    return `Waiting for ${neededForGroup} more participants to form a group...`;
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
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative">
          {/* Top Right Countdown Timer - Individual Participant Timer */}
          {participantTimerStart && !isGroupComplete && !(participantTimerExpired || status === 'expired') && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 z-10"
            >
              <div className={`
                px-3 py-2 rounded-lg shadow-md border font-mono text-sm font-bold
                ${participantTimeLeft <= 60
                  ? 'bg-red-100 border-red-300 text-red-700'
                  : participantTimeLeft <= 180
                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                    : 'bg-blue-100 border-blue-300 text-blue-700'
                }
              `}>
                <div className="flex items-center space-x-2">
                  <Clock className={`h-4 w-4 ${participantTimeLeft <= 60 ? 'animate-pulse' : ''}`} />
                  <span>{formatTime(participantTimeLeft)}</span>
                </div>
                <div className="text-xs font-normal mt-1 opacity-75 text-center">
                  Your time left
                </div>
              </div>
            </motion.div>
          )}

          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${participantTimerExpired || status === 'expired'
                ? 'bg-gradient-to-r from-red-600 to-red-700'
                : isGroupComplete
                  ? 'bg-gradient-to-r from-green-600 to-green-700'
                  : 'bg-gradient-to-r from-primary-600 to-accent-600'
                }`}
            >
              {participantTimerExpired || status === 'expired' ? (
                <Clock className="h-8 w-8 text-white" />
              ) : isGroupComplete ? (
                <CheckCircle className="h-8 w-8 text-white" />
              ) : (
                <Users className="h-8 w-8 text-white" />
              )}
            </motion.div>

            <CardTitle className="text-2xl font-bold text-gray-900">
              {participantTimerExpired || status === 'expired'
                ? "Time Expired"
                : isGroupComplete
                  ? "Group Complete!"
                  : "Experiment Waiting Room"}
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
            {!(participantTimerExpired || status === 'expired') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Waiting for Group Formation
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {currentWaiting % 3 || 3} / 3 in current group
                  </span>
                </div>

                <Progress
                  value={((currentWaiting % 3 || 3) / 3) * 100}
                  className="h-3"
                />

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Groups form automatically when 3 participants are ready</span>
                  <span>{currentWaiting} total waiting</span>
                </div>
              </div>
            )}

            {/* Current Group Slots Visualization */}
            <div className="flex justify-center space-x-4">
              {Array.from({ length: 3 }, (_, index) => {
                const currentGroupCount = currentWaiting % 3 || 3;
                const isSlotFilled = index < currentGroupCount;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`
                      w-16 h-16 rounded-full border-2 flex items-center justify-center
                      ${isSlotFilled
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}
                  >
                    {isSlotFilled ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Users className="h-6 w-6" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {participantTimerExpired || status === 'expired' ? (
                <motion.div
                  key="expired"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-red-700 mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="font-semibold">Your Time Expired</span>
                    </div>
                    <p className="text-red-600 text-sm mb-3">
                      Your 10-minute waiting period has ended. You were not matched with a group in time.
                    </p>
                    <div className="mt-4 text-xs text-red-500">
                      You may close this page or contact the experiment administrator.
                    </div>
                  </div>
                </motion.div>
              ) : !isGroupComplete ? (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-3"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-blue-700 mb-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-semibold">
                        Waiting for more participants...
                      </span>
                    </div>
                    <p className="text-xs text-blue-600">
                      Your group will form automatically when ready
                    </p>
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
                      <span className="font-semibold">Your group is complete!</span>
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

            {/* Room Info Banner */}
            {category && category !== 'No Gender' && !(participantTimerExpired || status === 'expired') && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 mb-1">
                      {category === 'All Male' && 'All Male Room'}
                      {category === 'All Female' && 'All Female Room'}
                      {category === 'Mixed' && 'Mixed Gender Room'}
                    </h4>
                    <p className="text-sm text-purple-800">
                      Groups of 3 {category === 'All Male' ? 'male' : category === 'All Female' ? 'female' : ''} participants form automatically
                    </p>
                    {participantGender && (
                      <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 bg-white rounded-md border border-purple-200">
                        <span className="text-xs text-purple-700">Your gender:</span>
                        <span className="text-xs font-semibold text-purple-900">{participantGender}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!(participantTimerExpired || status === 'expired') && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="p-1 rounded bg-gray-200">
                    <AlertCircle className="h-4 w-4 text-gray-700" />
                  </div>
                  Important Instructions
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span><strong>Keep this page open</strong> - Do not close or refresh</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span><strong>You have 10 minutes</strong> to be matched with a group</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span><strong>Groups of 3</strong> form automatically as participants join</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span>You'll be <strong>redirected automatically</strong> when your group is ready</span>
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}