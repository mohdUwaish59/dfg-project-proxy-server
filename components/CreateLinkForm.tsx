'use client';

import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from '../contexts/ToastContext';
import { Loader2, Plus, Users, Link, Copy } from 'lucide-react';

interface CreateLinkFormProps {
  onLinkCreated: () => void;
}

interface CreatedLinkInfo {
  proxyId: string;
  proxyUrl: string;
  postExperimentRedirectUrl: string;
}

export default function CreateLinkForm({ onLinkCreated }: CreateLinkFormProps) {
  const [formData, setFormData] = useState({
    groupName: '',
    realUrl: '',
    otreeSessionId: '',
    category: '',
    treatmentTitle: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<CreatedLinkInfo | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const proxyUrl = `${window.location.origin}/proxy/${data.proxyId}`;
        const postExperimentRedirectUrl = `${window.location.origin}/redirect/${data.proxyId}`;
        
        setCreatedLink({
          proxyId: data.proxyId,
          proxyUrl,
          postExperimentRedirectUrl
        });
        
        showToast('success', 'Success', 'Experiment link created successfully!');
        setFormData({ groupName: '', realUrl: '', otreeSessionId: '', category: '', treatmentTitle: '' });
        onLinkCreated();
      } else {
        const data = await response.json();
        showToast('error', 'Error', data.error || 'Failed to create link');
      }
    } catch (error) {
      showToast('error', 'Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', 'Copied!', `${label} copied to clipboard`);
    } catch (error) {
      showToast('error', 'Error', 'Failed to copy to clipboard');
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary-100 to-accent-100">
            <Plus className="h-5 w-5 text-primary-600" />
          </div>
          Create New Experiment Link
        </CardTitle>
        <CardDescription className="text-gray-600">
          Generate a secure proxy link for your oTree experiment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="groupName" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Group Name
              </Label>
              <Select
                value={formData.groupName}
                onValueChange={(value) => setFormData({ ...formData, groupName: value })}
                disabled={isLoading}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T1:MMM">T1:MMM</SelectItem>
                  <SelectItem value="T1:FFF">T1:FFF</SelectItem>
                  <SelectItem value="T1:MIXED">T1:MIXED</SelectItem>
                  <SelectItem value="T2:MMM">T2:MMM</SelectItem>
                  <SelectItem value="T2:FFF">T2:FFF</SelectItem>
                  <SelectItem value="T2:MIXED">T2:MIXED</SelectItem>
                  <SelectItem value="T3:MMM">T3:MMM</SelectItem>
                  <SelectItem value="T3:FFF">T3:FFF</SelectItem>
                  <SelectItem value="T3:MIXED">T3:MIXED</SelectItem>
                  <SelectItem value="T4:MMM">T4:MMM</SelectItem>
                  <SelectItem value="T4:FFF">T4:FFF</SelectItem>
                  <SelectItem value="T4:MIXED">T4:MIXED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="realUrl" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                oTree Experiment URL
              </Label>
              <Input
                id="realUrl"
                type="url"
                placeholder="https://your-otree-server.com/room/..."
                value={formData.realUrl}
                onChange={(e) => setFormData({ ...formData, realUrl: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* oTree Session ID Field */}
          <div className="space-y-2">
            <Label htmlFor="otreeSessionId" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              oTree Session ID
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="otreeSessionId"
              type="text"
              placeholder="e.g., abc123xyz or session_2024_01"
              value={formData.otreeSessionId}
              onChange={(e) => setFormData({ ...formData, otreeSessionId: e.target.value })}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the oTree session identifier to track this experiment
            </p>
          </div>

          {/* New Category and Treatment Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Male">All Male</SelectItem>
                  <SelectItem value="All Female">All Female</SelectItem>
                  <SelectItem value="Mixed">Mixed Gender</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentTitle">
                Treatment Title
              </Label>
              <Select
                value={formData.treatmentTitle}
                onValueChange={(value) => setFormData({ ...formData, treatmentTitle: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Treatment 1: No communication – No Gender Information">
                    Treatment 1: No communication – No Gender Information
                  </SelectItem>
                  <SelectItem value="Treatment 2: Chat Communication – No Gender Information">
                    Treatment 2: Chat Communication – No Gender Information
                  </SelectItem>
                  <SelectItem value="Treatment 3: Chat Communication – Gender Information">
                    Treatment 3: Chat Communication – Gender Information
                  </SelectItem>
                  <SelectItem value="Treatment 4: Video Chat Communication">
                    Treatment 4: Video Chat Communication
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full md:w-auto bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Link
              </>
            )}
          </Button>
        </form>

        {/* Success Message with Links */}
        {createdLink && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-green-800 font-semibold text-lg">
              <div className="p-2 rounded-full bg-green-200">
                <Plus className="h-5 w-5 text-green-700" />
              </div>
              Link Created Successfully!
            </div>

            <div className="space-y-4">
              {/* Unique Code */}
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  📋 Unique Link Code (Save This!)
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-yellow-50 border border-yellow-300 rounded font-mono text-lg font-bold text-yellow-900">
                    {createdLink.proxyId}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdLink.proxyId, 'Link code')}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  💡 Save this code! You'll need it to configure the post-experiment redirect URL after creating your Prolific study.
                </p>
              </div>

              {/* Pre-Experiment Link */}
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  🔗 Pre-Experiment Link (Share with Participants)
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-blue-50 border border-blue-300 rounded font-mono text-sm text-blue-900 truncate">
                    {createdLink.proxyUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdLink.proxyUrl, 'Pre-experiment link')}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Use this link as the Prolific study URL (participants start here)
                </p>
              </div>

              {/* Post-Experiment Link */}
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  🎯 Post-Experiment Redirect Link (Use in oTree)
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-purple-50 border border-purple-300 rounded font-mono text-sm text-purple-900 truncate">
                    {createdLink.postExperimentRedirectUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdLink.postExperimentRedirectUrl, 'Post-experiment link')}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Add this link to your oTree experiment's final page (participants end here)
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">📝 Next Steps:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Copy and save the <strong>Unique Link Code</strong> above</li>
                <li>Use the <strong>Pre-Experiment Link</strong> as your Prolific study URL</li>
                <li>Add the <strong>Post-Experiment Link</strong> to your oTree final page</li>
                <li>After creating your Prolific study, go to the "Links Table" below</li>
                <li>Click "Configure Post-Redirect" and paste your Prolific completion URL</li>
              </ol>
            </div>

            <Button
              variant="outline"
              onClick={() => setCreatedLink(null)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
