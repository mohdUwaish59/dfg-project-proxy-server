'use client';

import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from '../contexts/ToastContext';
import { Loader2, Plus, Users, Link } from 'lucide-react';

interface CreateLinkFormProps {
  onLinkCreated: () => void;
}

export default function CreateLinkForm({ onLinkCreated }: CreateLinkFormProps) {
  const [formData, setFormData] = useState({
    groupName: '',
    realUrl: '',
    category: '',
    treatmentTitle: ''
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
        setFormData({ groupName: '', realUrl: '', category: '', treatmentTitle: '' });
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
      </CardContent>
    </Card>
  );
}