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
  status: 'waiting' | 'redirected' | 'expired';
  isGroupComplete: boolean;
  redirectUrl?: string;
  groupName?: string;
  category?: string;
  treatmentTitle?: string;
  roomStartTime?: number; // Timestamp when first participant joined
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
  roomStartTime
}: WaitingRoomProps) {
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [roomTimeLeft, setRoomTimeLeft] = useState(600); // 10 minutes in seconds
  const [roomExpired, setRoomExpired] = useState(false);

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
    roomStartTime,
    roomTimeLeft,
    roomExpired
  });

  // Timer effect - runs when roomStartTime is provided or when participants join
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    // Start timer if backend provides roomStartTime OR if there are participants waiting
    if ((roomStartTime || currentWaiting >= 1) && !isGroupComplete && status !== 'expired') {
      console.log('Starting timer - roomStartTime:', roomStartTime, 'currentWaiting:', currentWaiting);

      if (roomStartTime) {
        // Use backend-provided start time for accurate synchronization
        const now = Date.now();
        const elapsed = Math.floor((now - roomStartTime) / 1000);
        const initialTimeLeft = Math.max(0, 600 - elapsed);
        setRoomTimeLeft(initialTimeLeft);

        if (initialTimeLeft > 0) {
          timer = setInterval(() => {
            const currentTime = Date.now();
            const totalElapsed = Math.floor((currentTime - roomStartTime) / 1000);
            const timeLeft = Math.max(0, 600 - totalElapsed); // 10 minutes = 600 seconds

            console.log('Timer update - elapsed:', totalElapsed, 'timeLeft:', timeLeft);
            setRoomTimeLeft(timeLeft);

            if (timeLeft <= 0) {
              setRoomExpired(true);
              if (timer) clearInterval(timer);
            }
          }, 1000);
        } else {
          setRoomExpired(true);
        }
      } else {
        // Fallback: show countdown from 600 seconds when no roomStartTime yet
        console.log('Using fallback timer - waiting for backend roomStartTime');
        timer = setInterval(() => {
          setRoomTimeLeft(prev => {
            const newTime = Math.max(0, prev - 1);
            if (newTime <= 0) {
              setRoomExpired(true);
              if (timer) clearInterval(timer);
            }
            return newTime;
          });
        }, 1000);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [roomStartTime, currentWaiting, isGroupComplete, status]);

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
    if (roomExpired || status === 'expired') {
      return "Room time expired. Not all participants joined in time.";
    }

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
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative">
          {/* Top Right Countdown Timer */}
          {(roomStartTime || currentWaiting >= 1) && !isGroupComplete && !(roomExpired || status === 'expired') && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 z-10"
            >
              <div className={`
                px-3 py-2 rounded-lg shadow-md border font-mono text-sm font-bold
                ${roomTimeLeft <= 60
                  ? 'bg-red-100 border-red-300 text-red-700'
                  : roomTimeLeft <= 180
                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                    : 'bg-blue-100 border-blue-300 text-blue-700'
                }
              `}>
                <div className="flex items-center space-x-2">
                  <Clock className={`h-4 w-4 ${roomTimeLeft <= 60 ? 'animate-pulse' : ''}`} />
                  <span>{formatTime(roomTimeLeft)}</span>
                </div>
                <div className="text-xs font-normal mt-1 opacity-75 text-center">
                  Time left
                </div>
              </div>
            </motion.div>
          )}

          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${roomExpired || status === 'expired'
                ? 'bg-gradient-to-r from-red-600 to-red-700'
                : isGroupComplete
                  ? 'bg-gradient-to-r from-green-600 to-green-700'
                  : 'bg-gradient-to-r from-primary-600 to-accent-600'
                }`}
            >
              {roomExpired || status === 'expired' ? (
                <Clock className="h-8 w-8 text-white" />
              ) : isGroupComplete ? (
                <CheckCircle className="h-8 w-8 text-white" />
              ) : (
                <Users className="h-8 w-8 text-white" />
              )}
            </motion.div>

            <CardTitle className="text-2xl font-bold text-gray-900">
              {roomExpired || status === 'expired'
                ? "Room Expired"
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

            {/* Room Timer */}
            {(roomStartTime || currentWaiting >= 1) && !isGroupComplete && !(roomExpired || status === 'expired') && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 text-amber-800">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">
                    Room expires in: {formatTime(roomTimeLeft)}
                  </span>
                </div>
                <div className="mt-2">
                  <Progress
                    value={(roomTimeLeft / 600) * 100}
                    className="h-2"
                  />
                </div>
                <p className="text-xs text-amber-700 text-center mt-2">
                  Room will close automatically if not filled within 10 minutes
                </p>
              </div>
            )}

            {/* Progress Section */}
            {!(roomExpired || status === 'expired') && (
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
            )}

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
              {roomExpired || status === 'expired' ? (
                <motion.div
                  key="expired"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 text-red-700 mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="font-semibold">Room Time Expired</span>
                    </div>
                    <p className="text-red-600 text-sm mb-3">
                      The waiting room has closed because not all participants joined within 10 minutes.
                    </p>
                    <p className="text-red-600 text-sm">
                      Only {currentWaiting} out of {maxParticipants} participants joined.
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
            {!(roomExpired || status === 'expired') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Please keep this page open and wait for other participants</li>
                  <li>• Do not refresh or close this page</li>
                  <li>• You will be automatically redirected when everyone has joined</li>
                  <li>• The experiment will begin once all {maxParticipants} participants are ready</li>
                  <li>• The room will automatically close after 10 minutes if not filled</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}