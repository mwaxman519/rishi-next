'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface BuildStatus {
  environment: string;
  status: 'idle' | 'building' | 'success' | 'error';
  message?: string;
  packageName?: string;
  buildTime?: string;
}

export default function MobileDeploymentPage() {
  const [builds, setBuilds] = useState<Record<string, BuildStatus>>({
    development: { environment: 'development', status: 'idle' },
    staging: { environment: 'staging', status: 'idle' },
    production: { environment: 'production', status: 'idle' }
  });

  const buildApp = async (environment: string) => {
    setBuilds(prev => ({
      ...prev,
      [environment]: { 
        environment: environment,
        status: 'building', 
        message: 'Building mobile package...' 
      }
    }));

    try {
      const response = await fetch(`/api/admin/mobile-build/${environment}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setBuilds(prev => ({
          ...prev,
          [environment]: {
            environment: environment,
            status: 'success',
            message: result.message,
            packageName: result.packageName,
            buildTime: result.buildTime
          }
        }));
      } else {
        setBuilds(prev => ({
          ...prev,
          [environment]: {
            environment: environment,
            status: 'error',
            message: result.error || 'Build failed'
          }
        }));
      }
    } catch (error) {
      setBuilds(prev => ({
        ...prev,
        [environment]: {
          environment: environment,
          status: 'error',
          message: 'Network error occurred'
        }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'building':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'building':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const environments = [
    {
      key: 'development',
      title: 'Development Build',
      description: 'Connects to your current Replit workspace',
      backend: 'Replit Development Server',
      appId: 'com.rishi.platform.dev',
      color: 'border-gray-500'
    },
    {
      key: 'staging',
      title: 'Staging Build', 
      description: 'Connects to Replit Autoscale staging deployment',
      backend: 'https://rishi-staging.replit.app',
      appId: 'com.rishi.platform.staging',
      color: 'border-blue-500'
    },
    {
      key: 'production',
      title: 'Production Build',
      description: 'Connects to Vercel production deployment',
      backend: 'https://rishi-platform.vercel.app',
      appId: 'com.rishi.platform',
      color: 'border-green-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Smartphone className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Mobile App Deployment</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {environments.map((env) => {
          const build = builds[env.key];
          if (!build) return null;
          return (
            <Card key={env.key} className={`${env.color} border-2`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(build?.status || 'idle')}
                    {env.title}
                  </CardTitle>
                  <Badge className={`${getStatusColor(build?.status || 'idle')} text-white`}>
                    {build?.status}
                  </Badge>
                </div>
                <CardDescription>{env.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div><strong>Backend:</strong> {env.backend}</div>
                  <div><strong>App ID:</strong> {env.appId}</div>
                </div>

                {build?.message && (
                  <div className="text-sm p-2 bg-gray-100 rounded">
                    {build.message}
                  </div>
                )}

                {build?.packageName && build?.status === 'success' && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Package Ready:</div>
                    <div className="text-xs bg-green-50 p-2 rounded">
                      {build.packageName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Built: {build?.buildTime}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => buildApp(env.key)}
                  disabled={build?.status === 'building'}
                  className="w-full"
                  variant={build?.status === 'success' ? 'outline' : 'default'}
                >
                  {build?.status === 'building' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Building...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Build {env.title.split(' ')[0]} App
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps After Building</CardTitle>
          <CardDescription>
            Once your mobile package is built, follow these steps to deploy to VoltBuilder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Download the generated zip package from above</li>
            <li>Go to <a href="https://voltbuilder.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">VoltBuilder.com</a></li>
            <li>Create a new project and upload your zip file</li>
            <li>Configure Android/iOS build settings</li>
            <li>Click "Build" and wait for compilation (5-10 minutes)</li>
            <li>Download your native APK/IPA files</li>
            <li>Distribute via Firebase App Distribution or direct installation</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}