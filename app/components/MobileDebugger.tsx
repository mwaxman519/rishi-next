"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface DebugInfo {
  userAgent: string;
  platform: string;
  protocol: string;
  hostname: string;
  pathname: string;
  capacitorNative: boolean;
  capacitorWebView: boolean;
  localStorage: boolean;
  indexedDB: boolean;
  serviceWorker: boolean;
  geolocation: boolean;
  devicePixelRatio: number;
  screenSize: string;
  viewportSize: string;
  networkStatus: string;
  cookiesEnabled: boolean;
  javaScriptEnabled: boolean;
  capacitorPlugins: string[];
  errors: string[];
}

export default function MobileDebugger() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Capture console errors
    const originalError = console.error;
    console.error = (...args) => {
      setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
      originalError(...args);
    };

    // Capture unhandled errors
    const errorHandler = (event: ErrorEvent) => {
      setLogs(prev => [...prev, `UNHANDLED ERROR: ${event.message} at ${event.filename}:${event.lineno}`]);
    };
    window.addEventListener('error', errorHandler);

    // Capture promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      setLogs(prev => [...prev, `PROMISE REJECTION: ${event.reason}`]);
    };
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      console.error = originalError;
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  const collectDebugInfo = async (): Promise<DebugInfo> => {
    const errors: string[] = [];

    // Check for Capacitor
    let capacitorNative = false;
    let capacitorWebView = false;
    let capacitorPlugins: string[] = [];

    try {
      // @ts-ignore
      if (window.Capacitor) {
        capacitorNative = true;
        // @ts-ignore
        capacitorWebView = window.Capacitor.isNativePlatform();
        // @ts-ignore
        capacitorPlugins = Object.keys(window.Capacitor.Plugins || {});
      }
    } catch (e) {
      errors.push(`Capacitor check failed: ${e}`);
    }

    // Network status
    let networkStatus = 'unknown';
    try {
      // @ts-ignore
      networkStatus = navigator.onLine ? 'online' : 'offline';
      // @ts-ignore
      if (navigator.connection) {
        // @ts-ignore
        networkStatus += ` (${navigator.connection.effectiveType})`;
      }
    } catch (e) {
      errors.push(`Network status check failed: ${e}`);
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      capacitorNative,
      capacitorWebView,
      localStorage: !!window.localStorage,
      indexedDB: !!window.indexedDB,
      serviceWorker: 'serviceWorker' in navigator,
      geolocation: 'geolocation' in navigator,
      devicePixelRatio: window.devicePixelRatio,
      screenSize: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      networkStatus,
      cookiesEnabled: navigator.cookieEnabled,
      javaScriptEnabled: true, // If this runs, JS is enabled
      capacitorPlugins,
      errors
    };
  };

  const loadDebugInfo = async () => {
    const info = await collectDebugInfo();
    setDebugInfo(info);
  };

  const testCapacitorFeatures = async () => {
    const testLogs: string[] = [];
    
    try {
      // @ts-ignore
      if (window.Capacitor) {
        testLogs.push('✅ Capacitor object found');
        
        // Test App plugin
        try {
          // @ts-ignore
          const appInfo = await window.Capacitor.Plugins.App.getInfo();
          testLogs.push(`✅ App plugin working: ${appInfo.name} v${appInfo.version}`);
        } catch (e) {
          testLogs.push(`❌ App plugin failed: ${e}`);
        }

        // Test Device plugin
        try {
          // @ts-ignore
          const deviceInfo = await window.Capacitor.Plugins.Device.getInfo();
          testLogs.push(`✅ Device plugin working: ${deviceInfo.platform} ${deviceInfo.model}`);
        } catch (e) {
          testLogs.push(`❌ Device plugin failed: ${e}`);
        }

      } else {
        testLogs.push('❌ Capacitor object not found - running in browser');
      }
    } catch (e) {
      testLogs.push(`❌ Capacitor test failed: ${e}`);
    }

    setLogs(prev => [...prev, ...testLogs]);
  };

  const sendDebugReport = async () => {
    const report = {
      debugInfo,
      logs: logs.slice(-50), // Last 50 logs
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Copy to clipboard for easy sharing
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setLogs(prev => [...prev, '✅ Debug report copied to clipboard']);
    } catch (e) {
      setLogs(prev => [...prev, `❌ Failed to copy report: ${e}`]);
    }
  };

  useEffect(() => {
    loadDebugInfo();
  }, []);

  if (!showDebugger) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setShowDebugger(true)}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center"
        >
          🔧
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Mobile Debug Console</h2>
          <Button 
            onClick={() => setShowDebugger(false)}
            variant="outline"
            size="sm"
          >
            Close
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Environment Info */}
          <div>
            <h3 className="font-semibold mb-2">Environment Information</h3>
            {debugInfo && (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                <div>Platform: {debugInfo.platform}</div>
                <div>Protocol: {debugInfo.protocol}</div>
                <div>Hostname: {debugInfo.hostname}</div>
                <div>Capacitor Native: {debugInfo.capacitorNative ? '✅' : '❌'}</div>
                <div>Capacitor WebView: {debugInfo.capacitorWebView ? '✅' : '❌'}</div>
                <div>Network: {debugInfo.networkStatus}</div>
                <div>Screen: {debugInfo.screenSize}</div>
                <div>Viewport: {debugInfo.viewportSize}</div>
                <div>Plugins: {debugInfo.capacitorPlugins.join(', ') || 'None'}</div>
              </div>
            )}
          </div>

          {/* Feature Tests */}
          <div>
            <h3 className="font-semibold mb-2">Feature Tests</h3>
            <div className="space-x-2">
              <Button onClick={testCapacitorFeatures} size="sm">
                Test Capacitor
              </Button>
              <Button onClick={loadDebugInfo} size="sm">
                Refresh Info
              </Button>
              <Button onClick={sendDebugReport} size="sm">
                Copy Report
              </Button>
            </div>
          </div>

          {/* Live Logs */}
          <div>
            <h3 className="font-semibold mb-2">Live Logs ({logs.length})</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded h-48 overflow-auto text-sm font-mono">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.slice(-20).map((log, i) => (
                  <div key={i} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
            <Button 
              onClick={() => setLogs([])} 
              size="sm" 
              variant="outline" 
              className="mt-2"
            >
              Clear Logs
            </Button>
          </div>

          {/* User Agent */}
          <div>
            <h3 className="font-semibold mb-2">User Agent</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono break-all">
              {debugInfo?.userAgent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}