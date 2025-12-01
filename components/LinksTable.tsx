'use client';

import { useState, useMemo } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from '../contexts/ToastContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Copy,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Users,
  Link,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  X,
  Settings,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface Link {
  proxy_id: string;
  group_name: string;
  real_url: string;
  otree_session_id?: string;
  category?: string;
  treatment_title?: string;
  post_experiment_redirect_url?: string;
  current_uses: number;
  max_uses: number;
  is_active: boolean;
  status?: string; // active, used, inactive
  completed_at?: string;
  created_at: string;
  waiting_count?: number;
  waiting_participants?: Array<{
    participant_number: number;
    joined_at: string;
  }>;
}

interface LinksTableProps {
  links: Link[];
  onLinkAction: () => void;
  onViewRoom?: (proxyId: string) => void;
}

export default function LinksTable({ links, onLinkAction, onViewRoom }: LinksTableProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [treatmentFilter, setTreatmentFilter] = useState('all');
  const [configureRedirectModal, setConfigureRedirectModal] = useState<{
    proxyId: string;
    groupName: string;
    otreeSessionId: string;
    currentUrl: string;
  } | null>(null);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Get unique categories and treatments for filter options
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(links.map(link => link.category).filter(Boolean))) as string[];
    return uniqueCategories.sort();
  }, [links]);

  const treatments = useMemo(() => {
    const uniqueTreatments = Array.from(new Set(links.map(link => link.treatment_title).filter(Boolean))) as string[];
    return uniqueTreatments.sort();
  }, [links]);

  // Filter links based on search term and filters
  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      // Search term filter (searches in group name, oTree session ID, category, and treatment)
      const matchesSearch = searchTerm === '' || 
        link.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.otree_session_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.treatment_title?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === 'all' || link.category === categoryFilter;

      // Treatment filter
      const matchesTreatment = treatmentFilter === 'all' || link.treatment_title === treatmentFilter;

      return matchesSearch && matchesCategory && matchesTreatment;
    });
  }, [links, searchTerm, categoryFilter, treatmentFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setTreatmentFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'all' || treatmentFilter !== 'all';

  const copyToClipboard = async (text: string, message: string = 'Proxy link copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', 'Copied!', message);
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

  const openConfigureRedirect = (link: Link) => {
    setConfigureRedirectModal({
      proxyId: link.proxy_id,
      groupName: link.group_name,
      otreeSessionId: link.otree_session_id || 'N/A',
      currentUrl: link.post_experiment_redirect_url || ''
    });
    setRedirectUrl(link.post_experiment_redirect_url || '');
  };

  const updatePostRedirect = async () => {
    if (!configureRedirectModal) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/update-post-redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          proxyId: configureRedirectModal.proxyId,
          postExperimentRedirectUrl: redirectUrl
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('success', 'Success', 'Post-experiment redirect URL updated successfully');
        setConfigureRedirectModal(null);
        setRedirectUrl('');
        onLinkAction();
      } else {
        throw new Error(data.error || 'Failed to update redirect URL');
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to update post-experiment redirect URL');
    } finally {
      setIsUpdating(false);
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
        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by group name, session ID, category, or treatment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Treatment Filter */}
            <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Treatments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Treatments</SelectItem>
                {treatments.map(treatment => (
                  <SelectItem key={treatment} value={treatment}>
                    {treatment.length > 40 ? `${treatment.substring(0, 40)}...` : treatment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredLinks.length} of {links.length} experiment{links.length !== 1 ? 's' : ''}
            </span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Filtered
              </Badge>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>oTree Session</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Proxy Link</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {hasActiveFilters 
                          ? 'No experiments match your search criteria' 
                          : 'No experiments found'
                        }
                      </p>
                      {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLinks.map((link) => {
                // Calculate progress including both completed and waiting participants
                const totalParticipants = link.current_uses + (link.waiting_count || 0);
                const usagePercent = (totalParticipants / link.max_uses) * 100;
                const isFull = link.current_uses >= link.max_uses;
                const isUsed = link.status === 'used';
                
                // For used links, show full progress and maintain current_uses
                const displayUsagePercent = isUsed ? 100 : usagePercent;
                const displayTotalParticipants = isUsed ? link.max_uses : totalParticipants;
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
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {link.otree_session_id || 'N/A'}
                        </code>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {link.category || 'Not Set'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="max-w-[200px]">
                        <span className="text-sm text-muted-foreground truncate" title={link.treatment_title}>
                          {link.treatment_title || 'Not Set'}
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
                          <span className="truncate max-w-[200px]" title={link.real_url}>
                            {link.real_url}
                          </span>
                        </div>
                        {link.post_experiment_redirect_url && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-[200px]" title={link.post_experiment_redirect_url}>
                              Post: {link.post_experiment_redirect_url}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {displayTotalParticipants}/{link.max_uses}
                            </span>
                            {isUsed ? (
                              <span className="text-xs text-green-600 font-medium">
                                All participants completed
                              </span>
                            ) : link.waiting_count && link.waiting_count > 0 ? (
                              <span className="text-xs text-muted-foreground">
                                {link.current_uses} completed, {link.waiting_count} waiting
                              </span>
                            ) : null}
                          </div>
                          {!isUsed && link.is_active && link.waiting_count !== undefined && link.waiting_count > 0 && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {link.waiting_count} waiting
                            </Badge>
                          )}
                          {isUsed && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <div className="relative">
                          <Progress
                            value={displayUsagePercent}
                            className={`h-2 ${isUsed ? 'opacity-90' : ''}`}
                          />
                          {/* Show completed portion in different color for active links with waiting participants */}
                          {!isUsed && link.waiting_count && link.waiting_count > 0 && (
                            <div 
                              className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all"
                              style={{ width: `${(link.current_uses / link.max_uses) * 100}%` }}
                            />
                          )}
                          {/* For used links, show full green bar */}
                          {isUsed && (
                            <div className="absolute top-0 left-0 h-2 bg-green-500 rounded-full w-full transition-all" />
                          )}
                        </div>
                        {link.is_active && link.waiting_count !== undefined && link.waiting_count > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                              Participants in waiting room: {link.waiting_participants?.map(p => `#${p.participant_number}`).join(', ')}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Completed</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Waiting</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          !link.is_active
                            ? "secondary"
                            : isUsed
                              ? "default"
                              : isFull
                                ? "destructive"
                                : "default"
                        }
                        className={
                          isUsed 
                            ? "bg-green-100 text-green-800 border-green-300"
                            : !link.is_active
                              ? ""
                              : isFull
                                ? "bg-red-100 text-red-800 border-red-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                        }
                      >
                        {!link.is_active 
                          ? 'Inactive' 
                          : isUsed 
                            ? 'Used' 
                            : isFull 
                              ? 'Full' 
                              : 'Active'
                        }
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
                        {onViewRoom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewRoom(link.proxy_id)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                            title="View waiting room details"
                          >
                            <Users className="h-3 w-3" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(proxyUrl)}
                          className="h-8 w-8 p-0"
                          title="Copy pre-experiment link"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfigureRedirect(link)}
                          className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
                          title="Configure post-experiment redirect URL"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>

                        {link.post_experiment_redirect_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              `${window.location.origin}/redirect/${link.proxy_id}`,
                              'Post-experiment redirect link copied! Use this in your oTree final page.'
                            )}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            title="Copy post-experiment redirect link for oTree"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}

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
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Configure Post-Experiment Redirect Modal */}
      <Dialog open={!!configureRedirectModal} onOpenChange={() => setConfigureRedirectModal(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Configure Post-Experiment Redirect
            </DialogTitle>
            <DialogDescription>
              Set the Prolific completion URL for <strong>{configureRedirectModal?.groupName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="redirectUrl" className="text-sm font-semibold">
                Prolific Completion URL
              </Label>
              <Input
                id="redirectUrl"
                type="url"
                placeholder="https://app.prolific.com/submissions/complete?cc=XXXXXXXX"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                disabled={isUpdating}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                After creating your Prolific study, copy the completion URL and paste it here.
              </p>
            </div>

            {configureRedirectModal && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-blue-900">Link Code:</Label>
                  <code className="block mt-1 px-2 py-1 bg-white border border-blue-300 rounded text-sm font-mono text-blue-900">
                    {configureRedirectModal.proxyId}
                  </code>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-blue-900">oTree Session ID:</Label>
                  <code className="block mt-1 px-2 py-1 bg-white border border-blue-300 rounded text-sm font-mono text-blue-900">
                    {configureRedirectModal.otreeSessionId}
                  </code>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-blue-900">Post-Experiment Link (for oTree):</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono text-blue-900 truncate">
                      {`${window.location.origin}/redirect/${configureRedirectModal.proxyId}`}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `${window.location.origin}/redirect/${configureRedirectModal.proxyId}`,
                        'Post-experiment link'
                      )}
                      className="shrink-0 h-7"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Add this link to your oTree experiment's final page
                  </p>
                </div>
              </div>
            )}

            {configureRedirectModal?.currentUrl && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <Label className="text-xs font-semibold text-amber-900">Current URL:</Label>
                <code className="block mt-1 px-2 py-1 bg-white border border-amber-300 rounded text-xs font-mono text-amber-900 break-all">
                  {configureRedirectModal.currentUrl}
                </code>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfigureRedirectModal(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={updatePostRedirect}
              disabled={isUpdating || !redirectUrl}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Redirect URL'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}