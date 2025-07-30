"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function TestLoginPage() {
  const [username, setUsername] = useState("mike");
  const [password, setPassword] = useState("wrench519");
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    setIsLoading(true);
    setTestResult("Testing login...");
    
    try {
      // Step 1: Test login
      const loginResponse = await fetch("/api/auth-service/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!loginResponse.ok) {
        setTestResult(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
        return;
      }

      const loginData = await loginResponse.json();
      setTestResult(`Login successful! User: ${loginData.data.user.username}, Role: ${loginData.data.user.role}`);
      
      // Step 2: Test session immediately after login
      setTimeout(async () => {
        const sessionResponse = await fetch("/api/auth-service/session", {
          method: "GET",
          credentials: "include",
        });

        if (!sessionResponse.ok) {
          setTestResult(prev => prev + `\nSession check failed: ${sessionResponse.status}`);
          return;
        }

        const sessionData = await sessionResponse.json();
        if (sessionData.data.user) {
          setTestResult(prev => prev + `\nSession verified! User: ${sessionData.data.user.username}, Role: ${sessionData.data.user.role}`);
        } else {
          setTestResult(prev => prev + `\nSession check failed: User is null`);
        }
      }, 1000);
      
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSession = async () => {
    setIsLoading(true);
    setTestResult("Testing session...");
    
    try {
      const response = await fetch("/api/auth-service/session", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        setTestResult(`Session failed: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (data.data.user) {
        setTestResult(`Session successful! User: ${data.data.user.username}, Role: ${data.data.user.role}`);
      } else {
        setTestResult("Session check: No user found (not logged in)");
      }
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = async () => {
    setIsLoading(true);
    setTestResult("Testing logout...");
    
    try {
      const response = await fetch("/api/auth-service/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        setTestResult(`Logout failed: ${response.status} ${response.statusText}`);
        return;
      }

      setTestResult("Logout successful!");
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={testLogin} disabled={isLoading}>
              Test Login
            </Button>
            <Button onClick={testSession} disabled={isLoading} variant="outline">
              Test Session
            </Button>
            <Button onClick={testLogout} disabled={isLoading} variant="outline">
              Test Logout
            </Button>
          </div>
          
          {testResult && (
            <div className="mt-4">
              <Label>Test Result:</Label>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
                {testResult}
              </pre>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">Debug Information</h4>
            <p className="text-sm">
              <strong>Environment:</strong> {process.env.NODE_ENV}<br/>
              <strong>In iframe:</strong> {typeof window !== 'undefined' && window.self !== window.top ? 'Yes' : 'No'}<br/>
              <strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}