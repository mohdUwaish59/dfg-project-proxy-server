'use client';

import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { 
  Shield, 
  Users, 
  BarChart3, 
  Beaker, 
  Smartphone, 
  Settings,
  Link2,
  Code,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Shield,
    title: 'Secure Access Control',
    description: 'Enterprise-grade security with unique, single-use links that prevent unauthorized access and ensure data integrity.',
    highlight: 'Zero-trust architecture'
  },
  {
    icon: Users,
    title: 'Advanced Group Management',
    description: 'Sophisticated participant organization with dynamic group limits, real-time capacity monitoring, and automated allocation.',
    highlight: 'Smart allocation'
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Comprehensive dashboard with live participation metrics, conversion tracking, and detailed experiment insights.',
    highlight: 'Live monitoring'
  },
  {
    icon: Beaker,
    title: 'oTree Integration',
    description: 'Native integration with oTree framework, seamless experiment deployment, and researcher-optimized workflows.',
    highlight: 'Native support'
  },
  {
    icon: Smartphone,
    title: 'Cross-platform Compatible',
    description: 'Responsive design that delivers consistent experience across desktop, tablet, and mobile devices.',
    highlight: 'Universal access'
  },
  {
    icon: Settings,
    title: 'Zero-config Deployment',
    description: 'Production-ready setup with minimal configuration, automated scaling, and enterprise deployment options.',
    highlight: 'Deploy in minutes'
  }
];

const stats = [
  { label: 'Research Institutions', value: '500+' },
  { label: 'Experiments Conducted', value: '10K+' },
  { label: 'Participants Managed', value: '100K+' },
  { label: 'Uptime Guarantee', value: '99.9%' }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-background to-accent-50">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:60px_60px]" />
        <div className="relative">
          <div className="container mx-auto px-4 py-24 sm:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="outline" className="mb-6 px-4 py-2 border-primary-200 bg-primary-50 text-primary-700">
                <Link2 className="mr-2 h-4 w-4" />
                Professional Research Platform
              </Badge>
              
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                oTree Proxy
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  {" "}Server
                </span>
              </h1>
              
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Enterprise-grade link management system for academic research. 
                Create secure, trackable experiment links with advanced analytics and participant management.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="h-12 px-8 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800">
                  <Link href="/admin">
                    <Settings className="mr-2 h-5 w-5" />
                    Access Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="h-12 px-8 border-primary-200 text-primary-700 hover:bg-primary-50">
                  <Link href="/docs">
                    <Code className="mr-2 h-5 w-5" />
                    API Documentation
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-primary-700/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <CheckCircle className="mr-2 h-4 w-4" />
            Enterprise Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for Modern Research
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comprehensive tools designed specifically for academic researchers and institutions
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="group relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 group-hover:bg-primary-200 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-accent-100 text-accent-700">
                    {feature.highlight}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="container mx-auto px-4 py-24">
          <Card className="mx-auto max-w-4xl border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Ready to streamline your research?
              </h2>
              <p className="mb-8 text-lg text-gray-600">
                Join hundreds of research institutions using oTree Proxy Server for their experiments
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="h-12 px-8 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800">
                  <Link href="/admin">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 border-primary-200 text-primary-700 hover:bg-primary-50">
                  <Link href="/contact">
                    Contact Sales
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Link2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">oTree Proxy Server</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for researchers, by researchers. Open source and enterprise-ready.
            </p>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-sm text-muted-foreground">
            © 2024 oTree Proxy Server. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}