'use client';

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  Home,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

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

interface ProxyErrorPageProps {
  error: string;
  errorType: 'not_found' | 'full' | 'already_participated' | 'inactive' | 'already_joined';
  link?: Link;
  usage?: Usage;
  participantNumber?: number;
  joinedAt?: string;
}

export default function ProxyErrorPage({ error, errorType, link, usage, participantNumber, joinedAt }: ProxyErrorPageProps) {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'not_found':
        return {
          title: 'Link Not Found',
          description: 'The requested experiment link does not exist or has been deactivated.',
          icon: AlertTriangle,
          variant: 'destructive' as const
        };
      case 'full':
        return {
          title: 'Experiment Full',
          description: `This experiment group is already full. All ${link?.max_uses || 0} participants have joined.`,
          icon: Users,
          variant: 'default' as const
        };
      case 'already_participated':
        return {
          title: 'Already Participated',
          description: 'You have already joined this experiment group.',
          icon: CheckCircle,
          variant: 'default' as const
        };
      case 'already_joined':
        return {
          title: 'Already in Waiting Room',
          description: 'You have already joined this waiting room. Please use your original tab/window.',
          icon: UserCheck,
          variant: 'default' as const
        };
      case 'inactive':
        return {
          title: 'Experiment Inactive',
          description: 'This experiment is currently inactive. Please contact the administrator.',
          icon: XCircle,
          variant: 'secondary' as const
        };
      default:
        return {
          title: 'Error',
          description: error,
          icon: AlertTriangle,
          variant: 'destructive' as const
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-error-50 via-background to-warning-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-error-100 to-error-200">
              <Icon className="h-8 w-8 text-error-600" />
            </div>

            {link && (
              <Badge variant="outline" className="mx-auto px-4 py-2 border-primary-200 bg-primary-50 text-primary-700">
                <Users className="mr-2 h-4 w-4" />
                {link.group_name || 'Experiment Group'}
              </Badge>
            )}

            <CardTitle className="text-2xl font-bold text-gray-900">
              {config.title}
            </CardTitle>

            <CardDescription className="text-base text-gray-600">
              {config.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {usage && errorType === 'already_participated' && (
              <Alert className="border-primary-200 bg-primary-50">
                <UserCheck className="h-4 w-4 text-primary-600" />
                <AlertDescription className="text-primary-800">
                  <div className="font-semibold mb-1">
                    Participant #{usage.participant_number}
                  </div>
                  <div className="text-sm text-primary-700/70">
                    Joined on: {new Date(usage.used_at).toLocaleString()}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {errorType === 'already_joined' && participantNumber && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="font-semibold mb-2">
                    You are Participant #{participantNumber}
                  </div>
                  <div className="text-sm text-amber-700 space-y-2">
                    {joinedAt && (
                      <p>Joined at: {new Date(joinedAt).toLocaleString()}</p>
                    )}
                    <p className="font-medium">
                      ⚠️ Please return to your original tab/window to see your waiting room status.
                    </p>
                    <p>
                      Opening multiple tabs can cause issues with your participation.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {errorType === 'full' && link && (
              <Alert className="border-warning-200 bg-warning-50">
                <AlertTriangle className="h-4 w-4 text-warning-600" />
                <AlertDescription className="text-warning-800">
                  Please contact the administrator if you need access to this experiment.
                </AlertDescription>
              </Alert>
            )}

            <Button asChild className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800" size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}