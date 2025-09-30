'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Users,
  CheckCircle,
  UserCheck,
  BarChart3
} from 'lucide-react';

interface Stats {
  total: number;
  active: number;
  participants: number;
  full: number;
  used?: number;
  waiting?: number;
}

interface StatsGridProps {
  stats: Stats;
  links?: Array<{
    waiting_count?: number;
    is_active: boolean;
  }>;
}

const statItems = [
  {
    key: 'total' as keyof Stats,
    label: 'Total Groups',
    icon: Users,
    description: 'All experiment groups'
  },
  {
    key: 'active' as keyof Stats,
    label: 'Active Groups',
    icon: BarChart3,
    description: 'Currently accepting participants'
  },
  {
    key: 'participants' as keyof Stats,
    label: 'Total Participants',
    icon: UserCheck,
    description: 'Across all experiments'
  },
  {
    key: 'full' as keyof Stats,
    label: 'Completed Groups',
    icon: CheckCircle,
    description: 'Reached capacity'
  }
];

export default function StatsGrid({ stats, links }: StatsGridProps) {
  // Calculate waiting room stats
  const waitingRoomsCount = links?.filter(link => link.is_active && (link.waiting_count || 0) > 0).length || 0;
  const totalWaitingParticipants = links?.reduce((sum, link) => sum + (link.waiting_count || 0), 0) || 0;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => {
        const colors = [
          'from-primary-500 to-primary-600',
          'from-success-500 to-success-600',
          'from-accent-500 to-accent-600',
          'from-warning-500 to-warning-600'
        ];
        const bgColors = [
          'bg-primary-50',
          'bg-success-50',
          'bg-accent-50',
          'bg-warning-50'
        ];
        const textColors = [
          'text-primary-600',
          'text-success-600',
          'text-accent-600',
          'text-warning-600'
        ];

        return (
          <Card key={item.key} className="transition-all hover:shadow-lg border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {item.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${bgColors[index % 4]}`}>
                <item.icon className={`h-4 w-4 ${textColors[index % 4]}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold bg-gradient-to-r ${colors[index % 4]} bg-clip-text text-transparent`}>
                {stats[item.key]}
              </div>
              <p className="text-xs text-gray-500">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}

      {/* Waiting Room Stats - Only show if there are active waiting rooms */}
      {totalWaitingParticipants > 0 && (
        <Card className="transition-all hover:shadow-lg border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Active Waiting Rooms
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-4 w-4 text-blue-600 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {totalWaitingParticipants}
            </div>
            <p className="text-xs text-blue-600">
              {totalWaitingParticipants === 1 ? 'participant' : 'participants'} waiting in {waitingRoomsCount} {waitingRoomsCount === 1 ? 'room' : 'rooms'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}