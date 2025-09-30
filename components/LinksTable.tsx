'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from '../contexts/ToastContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Users,
  Link,
  Calendar,
  ExternalLink
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

interface LinksTableProps {
  links: Link[];
  onLinkAction: () => void;
}

export default function LinksTable({ links, onLinkAction }: LinksTableProps) {
  const { showToast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', 'Copied!', 'Proxy link copied to clipboard');
    } catch (error) {
      showToast('error', 'Error', 'Failed to copy link');
    }
  };

  const toggleLink = async (proxyId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/toggle-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ proxyId, activate: !isActive })
      });

      if (response.ok) {
        showToast('success', 'Success', `Group ${isActive ? 'paused' : 'activated'} successfully!`);
        onLinkAction();
      } else {
        throw new Error('Failed to toggle link');
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to update group status');
    }
  };

  const resetUsage = async (proxyId: string) => {
    if (!confirm('Reset this group? This will allow 3 new participants to join.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/reset-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ proxyId })
      });

      if (response.ok) {
        showToast('success', 'Success', 'Group usage reset successfully!');
        onLinkAction();
      } else {
        throw new Error('Failed to reset usage');
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to reset group usage');
    }
  };

  const deleteLink = async (proxyId: string, groupName: string) => {
    const confirmMessage = `Are you sure you want to delete the experiment link for "${groupName}"?\n\nThis action cannot be undone and will permanently remove:\n• The proxy link\n• All usage data\n• Participant records`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/delete-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ proxyId })
      });

      const data = await response.json();

      if (data.success) {
        showToast('success', 'Success', `Experiment link for "${groupName}" deleted successfully`);
        onLinkAction();
      } else {
        throw new Error(data.error || 'Failed to delete link');
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to delete experiment link');
    }
  };

  if (links.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-gradient-to-r from-primary-100 to-accent-100 p-4 mb-4">
            <Link className="h-8 w-8 text-primary-600" />
          </div>
          <CardTitle className="mb-2 text-gray-900">No experiment links yet</CardTitle>
          <CardDescription className="text-gray-600">
            Create your first experiment link using the form above.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary-100 to-accent-100">
            <Link className="h-5 w-5 text-primary-600" />
          </div>
          Experiment Links
        </CardTitle>
        <CardDescription className="text-gray-600">
          Manage your experiment proxy links and monitor participant activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Proxy Link</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => {
                const usagePercent = (link.current_uses / link.max_uses) * 100;
                const isFull = link.current_uses >= link.max_uses;
                const proxyUrl = `${window.location.origin}/proxy/${link.proxy_id}`;

                return (
                  <TableRow key={link.proxy_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {link.group_name || 'Unnamed Group'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-mono">
                          <span className="truncate max-w-[200px]" title={proxyUrl}>
                            {proxyUrl}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(proxyUrl)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">
                            {link.real_url}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          {link.current_uses}/{link.max_uses}
                        </div>
                        <Progress
                          value={usagePercent}
                          className="h-2"
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          !link.is_active
                            ? "secondary"
                            : isFull
                              ? "destructive"
                              : "default"
                        }
                      >
                        {!link.is_active ? 'Inactive' : (isFull ? 'Completed' : 'Active')}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(link.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(proxyUrl)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLink(link.proxy_id, link.is_active)}
                          className="h-8 w-8 p-0"
                        >
                          {link.is_active ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetUsage(link.proxy_id)}
                          className="h-8 w-8 p-0"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLink(link.proxy_id, link.group_name || 'Unnamed Group')}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}