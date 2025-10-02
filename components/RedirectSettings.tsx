'use client';

import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from '../contexts/ToastContext';
import { Loader2, Save, ExternalLink, Users, Settings, Copy } from 'lucide-react';

export default function RedirectSettings() {
  const [settings, setSettings] = useState({
    maleRedirectUrl: '',
    femaleRedirectUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/redirect-settings');
      const data = await response.json();
      
      if (response.ok) {
        setSettings({
          maleRedirectUrl: data.maleRedirectUrl || '',
          femaleRedirectUrl: data.femaleRedirectUrl || ''
        });
      }
    } catch (error) {
      console.error('Error fetching redirect settings:', error);
      showToast('error', 'Error', 'Failed to load redirect settings');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/redirect-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', 'Success', 'Redirect settings updated successfully!');
      } else {
        showToast('error', 'Error', data.error || 'Failed to update settings');
      }
    } catch (error) {
      showToast('error', 'Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testRedirect = (gender: 'male' | 'female') => {
    const url = gender === 'male' ? '/redirect/male' : '/redirect/female';
    window.open(url, '_blank');
  };

  if (isFetching) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          Gender-Based Redirect Settings
        </CardTitle>
        <CardDescription className="text-gray-600">
          Configure redirect URLs for male and female participants after experiment completion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Male Redirect URL */}
            <div className="space-y-3">
              <Label htmlFor="maleRedirectUrl" className="flex items-center gap-2 text-blue-700">
                <Users className="h-4 w-4" />
                Male Participants Redirect URL
              </Label>
              <Input
                id="maleRedirectUrl"
                type="url"
                placeholder="https://example.com/male-survey"
                value={settings.maleRedirectUrl}
                onChange={(e) => handleInputChange('maleRedirectUrl', e.target.value)}
                required
                disabled={isLoading}
                className="border-blue-200 focus:border-blue-500"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => testRedirect('male')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Test Male Redirect
                </Button>
              </div>
            </div>

            {/* Female Redirect URL */}
            <div className="space-y-3">
              <Label htmlFor="femaleRedirectUrl" className="flex items-center gap-2 text-pink-700">
                <Users className="h-4 w-4" />
                Female Participants Redirect URL
              </Label>
              <Input
                id="femaleRedirectUrl"
                type="url"
                placeholder="https://example.com/female-survey"
                value={settings.femaleRedirectUrl}
                onChange={(e) => handleInputChange('femaleRedirectUrl', e.target.value)}
                required
                disabled={isLoading}
                className="border-pink-200 focus:border-pink-500"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => testRedirect('female')}
                  className="text-pink-600 border-pink-200 hover:bg-pink-50"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Test Female Redirect
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Direct Redirect Links for oTree:</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-blue-700 mb-1 block">Male Participants Link:</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-3 py-2 rounded border text-sm flex-1 text-blue-800">
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/redirect/male` : '/api/redirect/male'}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = typeof window !== 'undefined' ? `${window.location.origin}/api/redirect/male` : '/api/redirect/male';
                        navigator.clipboard.writeText(link);
                        showToast('success', 'Copied!', 'Male redirect link copied to clipboard');
                      }}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-pink-700 mb-1 block">Female Participants Link:</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-3 py-2 rounded border text-sm flex-1 text-pink-800">
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/redirect/female` : '/api/redirect/female'}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = typeof window !== 'undefined' ? `${window.location.origin}/api/redirect/female` : '/api/redirect/female';
                        navigator.clipboard.writeText(link);
                        showToast('success', 'Copied!', 'Female redirect link copied to clipboard');
                      }}
                      className="text-pink-600 border-pink-200 hover:bg-pink-50"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <h4 className="font-semibold text-gray-900 mb-2">What participants will see:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Beautiful "🎉 Experiment Complete!" countdown screen</li>
                <li>• Gender-specific color themes (blue for male, pink for female)</li>
                <li>• 5-second animated countdown with progress bar</li>
                <li>• "Continue Now" button for manual redirect</li>
                <li>• Automatic redirect to your configured destination URL</li>
              </ul>
              
              <h4 className="font-semibold text-gray-900 mb-2 mt-3">How to use in oTree:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Copy the appropriate link above</li>
                <li>• In your oTree final page, add a button or link with the copied URL</li>
                <li>• Links work immediately after saving settings above</li>
              </ul>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}