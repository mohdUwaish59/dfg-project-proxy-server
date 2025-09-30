'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '../contexts/ToastContext';
import { Loader2, Plus, Users, Link } from 'lucide-react';

interface CreateLinkFormProps {
  onLinkCreated: () => void;
}

export default function CreateLinkForm({ onLinkCreated }: CreateLinkFormProps) {
  const [formData, setFormData] = useState({
    groupName: '',
    realUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
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
        showToast('success', 'Success', 'Experiment link created successfully!');
        setFormData({ groupName: '', realUrl: '' });
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
              <Input
                id="groupName"
                type="text"
                placeholder="e.g., Group-1"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                required
                disabled={isLoading}
              />
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
      </CardContent>
    </Card>
  );
}