"use client";

import React, { useState, useEffect } from 'react';

export default function UniversalDebugger() {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Always show debugger in development or mobile environments
    const isDev = process.env.NODE_ENV === 'development' || 
                  process.env.NEXT_PUBLIC_APP_ENV === 'development';
    
    const isMobileEnv = window.location.protocol === 'file:' ||
                        window.location.protocol === 'capacitor:' ||
                        navigator.userAgent.includes('Android') ||
                        navigator.userAgent.includes('CapacitorWebView') ||
                        window.location.hostname === 'localhost';

    if (isDev || isMobileEnv) {
      setIsVisible(true);
    }

    // Collect basic debug info
    const collectInfo = () => {
      const info = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        location: {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          pathname: window.location.pathname,
          href: window.location.href
        },
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        environment: {
          isDev,
          isMobileEnv,
          nodeEnv: process.env.NODE_ENV,
          nextPublicAppEnv: process.env.NEXT_PUBLIC_APP_ENV
        },
        capabilities: {
          localStorage: !!window.localStorage,
          sessionStorage: !!window.sessionStorage,
          indexedDB: !!window.indexedDB,
          geolocation: 'geolocation' in navigator,
          serviceWorker: 'serviceWorker' in navigator,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine
        },
        capacitor: {
          // @ts-ignore
          hasCapacitor: !!window.Capacitor,
          // @ts-ignore
          isNative: window.Capacitor?.isNativePlatform?.() || false,
          // @ts-ignore
          platform: window.Capacitor?.getPlatform?.() || 'unknown'
        }
      };
      setDebugInfo(info);
      setLogs(prev => [...prev, `Debug info collected at ${info.timestamp}`]);
    };

    collectInfo();

    // Capture console errors
    const originalError = console.error;
    console.error = (...args) => {
      setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
      originalError(...args);
    };

    // Capture unhandled errors
    const errorHandler = (event: ErrorEvent) => {
      setLogs(prev => [...prev, `UNHANDLED: ${event.message} at ${event.filename}:${event.lineno}`]);
    };
    window.addEventListener('error', errorHandler);

    return () => {
      console.error = originalError;
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  const [showDetails, setShowDetails] = useState(false);

  if (!isVisible) return null;

  return (
    <>
      {/* Always visible debug button */}
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 999999,
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        onClick={() => setShowDetails(!showDetails)}
      >
        🔧
      </div>

      {/* Debug panel */}
      {showDetails && (
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 999998,
            padding: '20px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'white'
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setShowDetails(false)}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                const report = JSON.stringify({ debugInfo, logs }, null, 2);
                navigator.clipboard?.writeText(report).then(() => {
                  setLogs(prev => [...prev, 'Debug report copied to clipboard']);
                }).catch(() => {
                  setLogs(prev => [...prev, 'Failed to copy to clipboard']);
                });
              }}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Copy Report
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Environment Detection</h3>
            {debugInfo && (
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '5px' }}>
                <div>Protocol: {debugInfo.location.protocol}</div>
                <div>Hostname: {debugInfo.location.hostname}</div>
                <div>User Agent: {debugInfo.userAgent}</div>
                <div>Platform: {debugInfo.platform}</div>
                <div>Capacitor: {debugInfo.capacitor.hasCapacitor ? '✅' : '❌'}</div>
                <div>Native: {debugInfo.capacitor.isNative ? '✅' : '❌'}</div>
                <div>Online: {debugInfo.capabilities.onLine ? '✅' : '❌'}</div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Logs ({logs.length})</h3>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '10px', 
              borderRadius: '5px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {logs.slice(-10).map((log, i) => (
                <div key={i} style={{ marginBottom: '5px' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3>Full Debug Info</h3>
            <pre style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '10px', 
              borderRadius: '5px',
              fontSize: '10px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}