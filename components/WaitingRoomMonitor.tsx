'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  ArrowLeft,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface WaitingRoomMonitorProps {
  proxyId: string;
  onBack: () => void;
}

interface Participant {
  participant_number: number;
  prolific_pid: string;
  gender: string;
  joined_at: string;
  redirected_at?: string;
  user_fingerprint?: string;
}

interface Group {
  group_session_id: string;
  group_number: number;
  members: Participant[];
  redirected_at: string;
}

interface WaitingRoomData {
  link: any;
  participants: {
    total: number;
    waiting: Participant[];
    redirected: Group[];
    expired: Participant[];
  };
  statistics: {
    total_participants: number;
    waiting_count: number;
    redirected_count: number;
    expired_count: number;
    groups_formed: number;
    capacity_remaining: number;
    capacity_percentage: number;
  };
}

export default function WaitingRoomMonitor({ proxyId, onBack }: WaitingRoomMonitorProps) {
  const [data, setData] = useState<WaitingRoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [proxyId]);

  const loadData = async () => {
    try {
      const response = await fetch(`/api/admin/waiting-room-details?proxyId=${proxyId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error loading waiting room data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading waiting room data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Failed to load waiting room data</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{data.link.group_name}</CardTitle>
              <CardDescription className="mt-2">
                Real-time monitoring of waiting room participants
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-gray-900">{data.statistics.total_participants}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {data.statistics.capacity_remaining} spots remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Waiting</p>
                <p className="text-3xl font-bold text-amber-600">{data.statistics.waiting_count}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              In waiting room
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Groups Formed</p>
                <p className="text-3xl font-bold text-green-600">{data.statistics.groups_formed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {data.statistics.redirected_count} participants redirected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Capacity</p>
                <p className="text-3xl font-bold text-purple-600">{data.statistics.capacity_percentage}%</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {data.link.max_uses} total capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Room Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Room Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Category</p>
              <Badge variant="outline" className="mt-1">{data.link.category || 'No Gender'}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Group Size</p>
              <p className="text-sm text-gray-900 mt-1">{data.link.group_size} participants per group</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <Badge 
                variant={data.link.is_active ? 'default' : 'secondary'}
                className="mt-1"
              >
                {data.link.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="waiting" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="waiting">
                Waiting ({data.statistics.waiting_count})
              </TabsTrigger>
              <TabsTrigger value="redirected">
                Redirected ({data.statistics.redirected_count})
              </TabsTrigger>
              <TabsTrigger value="expired">
                Expired ({data.statistics.expired_count})
              </TabsTrigger>
            </TabsList>

            {/* Waiting Participants */}
            <TabsContent value="waiting" className="space-y-4">
              {data.participants.waiting.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No participants waiting</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.participants.waiting.map((participant) => (
                    <div
                      key={participant.participant_number}
                      className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold">
                          #{participant.participant_number}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {participant.prolific_pid || 'No Prolific ID'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Gender: <span className="font-medium">{participant.gender || 'Not specified'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Joined at</p>
                        <p className="text-sm font-medium text-gray-900">{formatTime(participant.joined_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Redirected Participants (Grouped) */}
            <TabsContent value="redirected" className="space-y-4">
              {data.participants.redirected.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No groups formed yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.participants.redirected.map((group, index) => (
                    <div key={group.group_session_id} className="border border-green-200 rounded-lg overflow-hidden">
                      <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-900">
                              Group {index + 1}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              {group.members.length} members
                            </Badge>
                          </div>
                          <p className="text-sm text-green-700">
                            Redirected at {formatTime(group.redirected_at)}
                          </p>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {group.members.map((member) => (
                          <div
                            key={member.participant_number}
                            className="flex items-center justify-between p-4 bg-white hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold">
                                #{member.participant_number}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {member.prolific_pid || 'No Prolific ID'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Gender: <span className="font-medium">{member.gender || 'Not specified'}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Joined at</p>
                              <p className="text-sm font-medium text-gray-900">{formatTime(member.joined_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Expired Participants */}
            <TabsContent value="expired" className="space-y-4">
              {data.participants.expired.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No expired participants</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.participants.expired.map((participant) => (
                    <div
                      key={participant.participant_number}
                      className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold">
                          #{participant.participant_number}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {participant.prolific_pid || 'No Prolific ID'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Gender: <span className="font-medium">{participant.gender || 'Not specified'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Joined at</p>
                        <p className="text-sm font-medium text-gray-900">{formatTime(participant.joined_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
