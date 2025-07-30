"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthService } from "@/hooks/useAuthService";
import { useState } from "react";

export default function TestAuth() {
  const authService = useAuthService();
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    setIsLoading(true);
    setTestResult("");
    try {
      const result = await authService.login({
        username: "mike",
        password: "wrench519",
      });
      setTestResult(`Login successful: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`Login failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSession = async () => {
    setIsLoading(true);
    setTestResult("");
    try {
      const result = await authService.getSession();
      setTestResult(`Session: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`Session failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = async () => {
    setIsLoading(true);
    setTestResult("");
    try {
      await authService.logout();
      setTestResult("Logout successful");
    } catch (error) {
      setTestResult(`Logout failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testLogin} disabled={isLoading}>
              Test Login
            </Button>
            <Button onClick={testSession} disabled={isLoading}>
              Test Session
            </Button>
            <Button onClick={testLogout} disabled={isLoading}>
              Test Logout
            </Button>
          </div>
          {testResult && (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {testResult}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}