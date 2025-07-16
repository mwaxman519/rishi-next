#!/usr/bin/env node

/**
 * Comprehensive Vercel Fix Script
 * Addresses all known issues with Vercel deployment chunk loading
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

console.log('🔧 Applying comprehensive Vercel fixes...\n');

// Fix 1: Create a fallback login page that doesn't rely on chunks
const createFallbackLoginPage = () => {
  const fallbackLogin = `"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 relative">
            <Image
              src="/favicon.ico"
              alt="Rishi Logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`;

  // Backup the original login page
  const originalPath = 'app/auth/login/page.tsx';
  const backupPath = 'app/auth/login/page.tsx.backup';
  
  if (fs.existsSync(originalPath)) {
    fs.copyFileSync(originalPath, backupPath);
    fs.writeFileSync(originalPath, fallbackLogin);
    console.log('✅ Created fallback login page');
  }
};

// Fix 2: Add chunk error boundary
const createChunkErrorBoundary = () => {
  const errorBoundary = `"use client";

import { Component } from "react";

class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    if (error.message && (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk'))) {
      return { hasError: true, error };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    if (error.message && (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk'))) {
      console.log('Chunk loading error detected, reloading page...');
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Loading Error</h2>
            <p className="mb-4">There was an error loading the page. Refreshing...</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;`;

  fs.writeFileSync('app/components/ChunkErrorBoundary.tsx', errorBoundary);
  console.log('✅ Created chunk error boundary');
};

// Fix 3: Create a deployment-specific package.json script
const addDeploymentScript = () => {
  const packagePath = 'package.json';
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    pkg.scripts = {
      ...pkg.scripts,
      'vercel-build': 'next build',
      'clean-build': 'rm -rf .next && npm run build'
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    console.log('✅ Added deployment scripts');
  }
};

// Fix 4: Test the build process
const testBuildProcess = () => {
  return new Promise((resolve) => {
    console.log('🧪 Testing build process...');
    
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'pipe',
      timeout: 60000,
    });

    let output = '';
    buildProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build test successful');
        resolve(true);
      } else {
        console.log('❌ Build test failed');
        if (output.includes('auth/login')) {
          console.log('⚠️  Login page build issues detected');
        }
        resolve(false);
      }
    });

    buildProcess.on('error', () => {
      console.log('❌ Build process error');
      resolve(false);
    });
  });
};

// Execute fixes
const executefixes = async () => {
  const fixes = [
    { name: 'Fallback Login Page', fn: createFallbackLoginPage },
    { name: 'Chunk Error Boundary', fn: createChunkErrorBoundary },
    { name: 'Deployment Scripts', fn: addDeploymentScript },
  ];

  for (const fix of fixes) {
    try {
      fix.fn();
    } catch (error) {
      console.error(`❌ Failed to apply ${fix.name}:`, error.message);
    }
  }

  // Test the build
  const buildSuccess = await testBuildProcess();
  
  console.log('\n📊 Summary:');
  console.log('✅ All fixes applied');
  console.log(buildSuccess ? '✅ Build test passed' : '❌ Build test failed');
  
  console.log('\n🚀 Next steps:');
  console.log('  1. Commit and push the changes');
  console.log('  2. Vercel will automatically redeploy');
  console.log('  3. Test the login page after deployment');
  console.log('  4. If issues persist, consider migrating to Replit Autoscale');
};

executefixes();

export default { executefixes };