"use client";

import React from "react";
import { useAuth } from "./hooks/useAuth";
import { Button } from "./components/ui/button";
import Link from "next/link";
import MobileDebugger from "./components/MobileDebugger";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Package, 
  BarChart3,
  Settings,
  BookOpen,
  UserCheck
} from "lucide-react";

export default function MobilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading Rishi Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 text-white">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Rishi Platform</h1>
          <p className="text-blue-100">Mobile Workforce Management</p>
          {user && (
            <div className="mt-4 bg-white/10 rounded-lg p-3">
              <p className="text-sm">Welcome back, {user.fullName || user.username}</p>
              <p className="text-xs text-blue-200">{user.role}</p>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              className="h-20 w-full bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center justify-center"
            >
              <BarChart3 className="h-6 w-6 mb-1" />
              <span className="text-sm">Dashboard</span>
            </Button>
          </Link>

          <Link href="/bookings">
            <Button 
              variant="outline" 
              className="h-20 w-full bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center justify-center"
            >
              <Calendar className="h-6 w-6 mb-1" />
              <span className="text-sm">Bookings</span>
            </Button>
          </Link>

          <Link href="/staff">
            <Button 
              variant="outline" 
              className="h-20 w-full bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center justify-center"
            >
              <Users className="h-6 w-6 mb-1" />
              <span className="text-sm">Staff</span>
            </Button>
          </Link>

          <Link href="/locations">
            <Button 
              variant="outline" 
              className="h-20 w-full bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center justify-center"
            >
              <MapPin className="h-6 w-6 mb-1" />
              <span className="text-sm">Locations</span>
            </Button>
          </Link>

          <Link href="/inventory">
            <Button 
              variant="outline" 
              className="h-20 w-full bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center justify-center"
            >
              <Package className="h-6 w-6 mb-1" />
              <span className="text-sm">Inventory</span>
            </Button>
          </Link>

          <Link href="/training">
            <Button 
              variant="outline" 
              className="h-20 w-full bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center justify-center"
            >
              <BookOpen className="h-6 w-6 mb-1" />
              <span className="text-sm">Training</span>
            </Button>
          </Link>
        </div>

        {/* Authentication Section */}
        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Account</h3>
          {user ? (
            <div className="space-y-2">
              <Link href="/profile">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <UserCheck className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => {
                  // Simple logout - clear any local storage and redirect
                  localStorage.clear();
                  window.location.href = '/';
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login">
                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                  Sign In
                </Button>
              </Link>
              <p className="text-xs text-blue-200 text-center">
                Sign in to access all features
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-blue-200 text-sm">
          <p>Rishi Platform Mobile</p>
          <p>Development Build</p>
        </div>
      </div>
      
      {/* Mobile Debugger - Always available in development */}
      <MobileDebugger />
    </div>
  );
}