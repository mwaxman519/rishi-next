'use client';

import { useState } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Terminal, 
  Play, 
  Database, 
  Hammer, 
  Settings, 
  FileText, 
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  Folder,
  Archive
} from 'lucide-react';

interface ScriptExecution {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  output: string;
  startTime?: Date;
  endTime?: Date;
}

interface DownloadableFile {
  name: string;
  size: string;
  date: string;
  type: 'zip' | 'config' | 'mobile' | 'voltbuilder' | 'other';
  description?: string;
}

const DEV_SCRIPTS = {
  database: [
    {
      id: 'db-push',
      name: 'Push Database Schema',
      description: 'Apply schema changes to database',
      command: 'npm run db:push',
      category: 'database',
      icon: Database
    },
    {
      id: 'db-studio',
      name: 'Open Database Studio',
      description: 'Launch Drizzle Studio for database management',
      command: 'npm run db:studio',
      category: 'database',
      icon: Database
    },
    {
      id: 'db-generate',
      name: 'Generate Migrations',
      description: 'Generate database migration files',
      command: 'npm run db:generate',
      category: 'database',
      icon: Database
    }
  ],
  build: [
    {
      id: 'build-dev',
      name: 'Development Build',
      description: 'Build for development environment',
      command: 'npm run build',
      category: 'build',
      icon: Hammer
    },
    {
      id: 'build-mobile-dev',
      name: 'Mobile Build (Dev)',
      description: 'Build mobile app for development (proven working script from yesterday)',
      command: './scripts/build-mobile.sh development',
      category: 'build',
      icon: Hammer
    },
    {
      id: 'build-mobile-staging',
      name: 'Mobile Build (Staging)',
      description: 'Build mobile app for staging (proven working script from yesterday)',
      command: './scripts/build-mobile.sh staging',
      category: 'build',
      icon: Hammer
    },
    {
      id: 'build-mobile-prod',
      name: 'Mobile Build (Production)',
      description: 'Build mobile app for production (proven working script from yesterday)',
      command: './scripts/build-mobile.sh production',
      category: 'build',
      icon: Hammer
    }
  ],
  utilities: [
    {
      id: 'lint',
      name: 'Lint Code',
      description: 'Run ESLint on the codebase',
      command: 'npm run lint',
      category: 'utilities',
      icon: Settings
    },
    {
      id: 'type-check',
      name: 'Type Check',
      description: 'Run TypeScript type checking',
      command: 'npx tsc --noEmit',
      category: 'utilities',
      icon: Settings
    },
    {
      id: 'test',
      name: 'Run Tests',
      description: 'Execute test suite',
      command: 'npm test',
      category: 'utilities',
      icon: Settings
    },
    {
      id: 'clean-build',
      name: 'Clean Build Cache',
      description: 'Remove .next and node_modules/.cache',
      command: 'rm -rf .next && rm -rf node_modules/.cache',
      category: 'utilities',
      icon: RefreshCw
    }
  ],
  logs: [
    {
      id: 'logs-dev',
      name: 'List Process Status',
      description: 'View running Node.js processes',
      command: 'ps aux | grep node',
      category: 'logs',
      icon: FileText
    },
    {
      id: 'logs-database',
      name: 'Check Database Connection',
      description: 'Test database connectivity',
      command: 'npm run db:push',
      category: 'logs',
      icon: FileText
    }
  ]
};

export default function DevToolsPage() {
  // Only allow access in development environment
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Dev Tools Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Development tools are only available in development environment.
          </p>
        </div>
      </div>
    );
  }

  const [executions, setExecutions] = useState<Record<string, ScriptExecution>>({});
  const [downloadableFiles, setDownloadableFiles] = useState<DownloadableFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [activeTab, setActiveTab] = useState('database');

  const loadDownloadableFiles = async () => {
    setLoadingFiles(true);
    try {
      const response = await fetch('/api/admin/dev-tools/files', {
        credentials: 'include'
      });
      const result = await response.json();
      setDownloadableFiles(result.files || []);
    } catch (error) {
      console.error("Failed to load downloadable files:", error);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Load files on component mount
  React.useEffect(() => {
    loadDownloadableFiles();
  }, []);

  const executeScript = async (script: any) => {
    const executionId = script.id;
    
    setExecutions(prev => ({
      ...prev,
      [executionId]: {
        id: executionId,
        name: script.name,
        status: 'running',
        output: '',
        startTime: new Date()
      }
    }));

    try {
      const response = await fetch('/api/admin/dev-tools/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: script.command,
          scriptId: script.id
        }),
        credentials: 'include'
      });

      const result = await response.json();

      setExecutions(prev => ({
        ...prev,
        [executionId]: {
          ...prev[executionId],
          status: result.success ? 'success' : 'error',
          output: result.output || result.error,
          endTime: new Date()
        }
      }));

      // Refresh downloadable files if mobile build completed successfully
      if (result.success && script.id.includes('mobile')) {
        setTimeout(loadDownloadableFiles, 2000);
      }

    } catch (error) {
      setExecutions(prev => ({
        ...prev,
        [executionId]: {
          ...prev[executionId],
          status: 'error',
          output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          endTime: new Date()
        }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'bg-blue-500',
      success: 'bg-green-500',
      error: 'bg-red-500',
      idle: 'bg-gray-500'
    };
    return variants[status as keyof typeof variants] || variants.idle;
  };

  const downloadFile = async (filename: string) => {
    try {
      const response = await fetch(`/api/admin/dev-tools/download?file=${encodeURIComponent(filename)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Archive className="h-4 w-4 text-purple-600" />;
      case 'voltbuilder':
        return <Archive className="h-4 w-4 text-green-600" />;
      case 'zip':
        return <Archive className="h-4 w-4 text-blue-600" />;
      case 'config':
        return <Settings className="h-4 w-4 text-gray-600" />;
      default:
        return <Folder className="h-4 w-4 text-gray-400" />;
    }
  };

  const renderScriptCard = (script: any) => {
    const execution = executions[script.id];
    const IconComponent = script.icon;

    return (
      <Card key={script.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-sm">{script.name}</CardTitle>
              {execution && (
                <Badge 
                  variant="secondary" 
                  className={`${getStatusBadge(execution.status)} text-white text-xs`}
                >
                  {execution.status}
                </Badge>
              )}
            </div>
            {getStatusIcon(execution?.status || 'idle')}
          </div>
          <CardDescription className="text-xs">{script.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            onClick={() => executeScript(script)}
            disabled={execution?.status === 'running'}
            size="sm"
            className="w-full"
          >
            <Play className="h-3 w-3 mr-1" />
            {execution?.status === 'running' ? 'Running...' : 'Execute'}
          </Button>
          
          {execution && execution.output && (
            <div className="mt-3">
              <ScrollArea className="h-32 w-full rounded border bg-gray-50 dark:bg-gray-800 p-2">
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {execution.output}
                </pre>
              </ScrollArea>
              {execution.startTime && execution.endTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Completed in {Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)}s
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center space-x-2 mb-6">
        <Zap className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Development Tools Dashboard</h1>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          Dev Only
        </Badge>
      </div>

      <Alert className="mb-6">
        <Terminal className="h-4 w-4" />
        <AlertDescription>
          Execute development scripts, build mobile apps, and manage project utilities with one-click operations.
          <strong className="ml-2">Development Environment Only</strong>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="build">Build</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEV_SCRIPTS.database.map(renderScriptCard)}
          </div>
        </TabsContent>

        <TabsContent value="build" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEV_SCRIPTS.build.map(renderScriptCard)}
          </div>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEV_SCRIPTS.utilities.map(renderScriptCard)}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEV_SCRIPTS.logs.map(renderScriptCard)}
          </div>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Downloadable Files</span>
                </CardTitle>
                <Button 
                  onClick={loadDownloadableFiles}
                  disabled={loadingFiles}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loadingFiles ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Latest mobile app builds for each environment ready for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              {downloadableFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {loadingFiles ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading files...</span>
                    </div>
                  ) : (
                    <div>
                      <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No downloadable files available</p>
                      <p className="text-sm">Run mobile builds to generate downloadable packages</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {downloadableFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.description || 'Build package'} • {file.size} • {file.date}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => downloadFile(file.name)}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}