'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from '../contexts/ToastContext';
import { Info, ExternalLink, Copy } from 'lucide-react';

export default function RedirectSettings() {
  const { showToast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Copied!', `${label} copied to clipboard`);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100">
            <Info className="h-5 w-5 text-purple-600" />
          </div>
          Post-Experiment Redirect Guide
        </CardTitle>
        <CardDescription className="text-gray-600">
          Each experiment link now has its own unique post-experiment redirect URL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5" />
            How It Works
          </h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Each experiment link you create has its own post-experiment redirect URL</li>
            <li>• You configure the redirect URL when creating a new experiment link</li>
            <li>• This allows different experiments to redirect to different destinations</li>
            <li>• Perfect for managing 12 different treatment/gender combinations</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3">Using Redirect Links in oTree</h4>
          <p className="text-sm text-green-800 mb-3">
            After creating an experiment link, use this format in your oTree experiment:
          </p>
          <div className="bg-white p-3 rounded border border-green-300 mb-3">
            <code className="text-sm text-green-900">
              {typeof window !== 'undefined' 
                ? `${window.location.origin}/redirect/[PROXY_ID]` 
                : '/redirect/[PROXY_ID]'}
            </code>
          </div>
          <p className="text-xs text-green-700">
            Replace [PROXY_ID] with the actual proxy ID from your experiment link
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-3">Example Setup</h4>
          <div className="space-y-3 text-sm text-purple-800">
            <div>
              <p className="font-medium mb-1">1. Create experiment link:</p>
              <ul className="ml-4 space-y-1">
                <li>• Group: "Treatment 1 - All Male"</li>
                <li>• Category: All Male</li>
                <li>• Treatment: Treatment 1</li>
                <li>• Post-Experiment URL: https://prolific.com/completion?code=ABC123</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">2. System generates proxy ID:</p>
              <ul className="ml-4 space-y-1">
                <li>• Example: abc123def456</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">3. Use in oTree final page:</p>
              <ul className="ml-4 space-y-1">
                <li>• Link: {typeof window !== 'undefined' ? `${window.location.origin}/redirect/abc123def456` : '/redirect/abc123def456'}</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">4. Participant experience:</p>
              <ul className="ml-4 space-y-1">
                <li>• Clicks link in oTree</li>
                <li>• Sees beautiful countdown screen (5 seconds)</li>
                <li>• Automatically redirected to Prolific completion URL</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-3">Benefits of Link-Specific Redirects</h4>
          <ul className="text-sm text-amber-800 space-y-2">
            <li>✅ Different Prolific completion codes for each experiment</li>
            <li>✅ Separate tracking for different treatment groups</li>
            <li>✅ Flexibility to redirect to different platforms (Prolific, Qualtrics, etc.)</li>
            <li>✅ Easy management of 12 different experiment configurations</li>
            <li>✅ No confusion between different studies</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Reference</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Step 1:</strong> Create experiment link with post-experiment redirect URL</p>
            <p><strong>Step 2:</strong> Copy the proxy ID from the links table</p>
            <p><strong>Step 3:</strong> Use {typeof window !== 'undefined' ? `${window.location.origin}/redirect/[PROXY_ID]` : '/redirect/[PROXY_ID]'} in oTree</p>
            <p><strong>Step 4:</strong> Participants automatically redirected after experiment</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}