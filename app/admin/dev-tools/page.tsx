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
  type: 'zip' | 'config' | 'other';
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
      id: 'db-migrate',
      name: 'Generate Migration',
      description: 'Generate new database migration',
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
      description: 'Build mobile app for development',
      command: './scripts/build-mobile.sh development',
      category: 'build',
      icon: Hammer
    },
    {
      id: 'build-mobile-staging',
      name: 'Mobile Build (Staging)',
      description: 'Build mobile app for staging',
      command: './scripts/build-mobile.sh staging',
      category: 'build',
      icon: Hammer
    },
    {
      id: 'build-mobile-prod',
      name: 'Mobile Build (Production)',
      description: 'Build mobile app for production',
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
        setTimeout(() => {
          loadDownloadableFiles();
        }, 1000); // Small delay to ensure file is written
      }
    } catch (error) {
      setExecutions(prev => ({
        ...prev,
        [executionId]: {
          ...prev[executionId],
          status: 'error',
          output: error instanceof Error ? error.message : 'Unknown error',
          endTime: new Date()
        }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Terminal className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'default',
      success: 'default',
      error: 'destructive',
      idle: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const renderScriptCard = (script: any) => {
    const execution = executions[script.id];
    const IconComponent = script.icon;

    return (
      <Card key={script.id} className="transition-all hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">{script.name}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {execution && getStatusIcon(execution.status)}
              {execution && getStatusBadge(execution.status)}
            </div>
          </div>
          <CardDescription>{script.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <code className="text-sm text-gray-700 dark:text-gray-300">
              {script.command}
            </code>
          </div>
          
          <Button
            onClick={() => executeScript(script)}
            disabled={execution?.status === 'running'}
            className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
          >
            {execution?.status === 'running' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute
              </>
            )}
          </Button>

          {execution && execution.output && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Terminal className="h-4 w-4" />
                <span className="text-sm font-medium">Output</span>
                {execution.startTime && execution.endTime && (
                  <span className="text-xs text-gray-500">
                    ({Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)}s)
                  </span>
                )}
              </div>
              <ScrollArea className="h-32 w-full">
                <pre className={`text-xs p-3 rounded-lg ${
                  execution.status === 'error' 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                  {execution.output}
                </pre>
              </ScrollArea>
              
              {script.id.includes('mobile') && execution.status === 'success' && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Mobile Build Complete
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                    Generated files available for download:
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
                      <span>📱 VoltBuilder Package (.zip)</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          // Extract ZIP filename from output
                          const zipMatch = execution.output?.match(/rishi-mobile-\w+-\d{4}-\d{2}-\d{2}-\d{4}\.zip/);
                          if (zipMatch) {
                            window.open(`/admin/dev-tools/download/${zipMatch[0]}`, '_blank');
                          }
                        }}
                      >
                        Download
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
                      <span>⚙️ Capacitor Config</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2 text-xs"
                        onClick={() => window.open('/admin/dev-tools/download/capacitor.config.ts', '_blank')}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      💡 The ZIP file contains everything needed for VoltBuilder compilation
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Zap className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold">Developer Tools</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive dashboard for development scripts and utilities
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          These tools execute server-side scripts. Use caution in production environments.
          Scripts are executed with the same permissions as the application server.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="database" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </TabsTrigger>
          <TabsTrigger value="build" className="flex items-center space-x-2">
            <Hammer className="h-4 w-4" />
            <span>Build</span>
          </TabsTrigger>
          <TabsTrigger value="utilities" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Utilities</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Logs</span>
          </TabsTrigger>
          <TabsTrigger value="downloads" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Downloads</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DEV_SCRIPTS.database.map(renderScriptCard)}
          </div>
        </TabsContent>

        <TabsContent value="build" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DEV_SCRIPTS.build.map(renderScriptCard)}
          </div>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DEV_SCRIPTS.utilities.map(renderScriptCard)}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DEV_SCRIPTS.logs.map(renderScriptCard)}
          </div>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Folder className="h-5 w-5 text-purple-600" />
                  <CardTitle>Downloadable Files</CardTitle>
                </div>
                <Button 
                  onClick={loadDownloadableFiles}
                  disabled={loadingFiles}
                  variant="outline"
                  size="sm"
                >
                  {loadingFiles ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
              <CardDescription>
                Generated mobile builds, configurations, and other downloadable files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFiles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Loading files...</span>
                </div>
              ) : downloadableFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Archive className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No downloadable files found</p>
                  <p className="text-sm">Run a mobile build script to generate files</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {downloadableFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {file.type === 'zip' ? (
                            <Archive className="h-5 w-5 text-blue-600" />
                          ) : file.type === 'config' ? (
                            <Settings className="h-5 w-5 text-green-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{file.size}</span>
                            <span>{file.date}</span>
                            <Badge variant="outline" className="text-xs">
                              {file.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => window.open(`/admin/dev-tools/download/${file.name}`, '_blank')}
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                      >
                        <Download className="h-4 w-4 mr-1" />
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