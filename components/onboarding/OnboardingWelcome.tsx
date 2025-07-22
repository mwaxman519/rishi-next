/**
 * Personalized Onboarding Welcome Component
 * Character-driven tutorial system introduction
 */

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Sparkles, 
  MapPin, 
  Users, 
  Calendar, 
  Package,
  Trophy,
  ArrowRight,
  CheckCircle,
  Heart
} from 'lucide-react';

interface OnboardingWelcomeProps {
  user: {
    name: string;
    role: string;
    organization?: string;
  };
  onStartTutorial: (character: string) => void;
  onSkip: () => void;
}

// Character-driven tutorial guides
const tutorialCharacters = [
  {
    id: 'sage',
    name: 'Sage',
    role: 'Platform Expert',
    avatar: '🧙‍♀️',
    color: 'purple',
    specialty: 'Complete Platform Mastery',
    description: 'I\'ll guide you through every feature of the Rishi Platform, from basic navigation to advanced analytics.',
    modules: ['Dashboard Navigation', 'Organization Management', 'Advanced Features', 'Analytics & Reports'],
    duration: '15-20 minutes',
    difficulty: 'Comprehensive'
  },
  {
    id: 'luna',
    name: 'Luna',
    role: 'Field Operations Specialist',
    avatar: '👩‍🏭',
    color: 'teal',
    specialty: 'Field Worker Essentials',
    description: 'Perfect for field workers! I\'ll show you mobile-friendly features and offline capabilities.',
    modules: ['Mobile Interface', 'Offline Features', 'Location Check-ins', 'Task Management'],
    duration: '8-12 minutes',
    difficulty: 'Quick Start'
  },
  {
    id: 'alex',
    name: 'Alex',
    role: 'Manager\'s Assistant',
    avatar: '👨‍💼',
    color: 'blue',
    specialty: 'Management Tools',
    description: 'I specialize in management features - staff oversight, scheduling, and performance tracking.',
    modules: ['Staff Management', 'Scheduling', 'Performance Analytics', 'Reporting'],
    duration: '12-15 minutes',
    difficulty: 'Management Focus'
  }
];

export default function OnboardingWelcome({ user, onStartTutorial, onSkip }: OnboardingWelcomeProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [showPersonalization, setShowPersonalization] = useState(false);

  const getRoleRecommendation = (userRole: string) => {
    if (userRole.includes('admin') || userRole.includes('manager')) return 'alex';
    if (userRole.includes('agent') || userRole.includes('field')) return 'luna';
    return 'sage';
  };

  const recommendedCharacter = getRoleRecommendation(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
            Welcome to Rishi Platform, {user.name}!
          </CardTitle>
          
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Let's get you started with a personalized tutorial designed just for your role as a{' '}
            <Badge variant="secondary" className="mx-1">{user.role}</Badge>
            {user.organization && (
              <>
                at <Badge variant="outline" className="mx-1">{user.organization}</Badge>
              </>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!showPersonalization ? (
            <div className="text-center space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <MapPin className="w-8 h-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium">Locations</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-teal-50 dark:bg-teal-900/20">
                  <Users className="w-8 h-8 text-teal-600 mb-2" />
                  <span className="text-sm font-medium">Staff</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Calendar className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">Scheduling</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Package className="w-8 h-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium">Inventory</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-100 to-teal-100 dark:from-purple-900/30 dark:to-teal-900/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Personalized Learning Experience
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose your guide for a tailored tutorial experience. Each character specializes in different aspects 
                  of the platform to match your specific needs and role.
                </p>
              </div>

              <Button 
                onClick={() => setShowPersonalization(true)}
                className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white px-8 py-3 rounded-lg font-medium"
                size="lg"
              >
                Choose Your Tutorial Guide
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center mb-6">Choose Your Tutorial Character</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                {tutorialCharacters.map((character) => (
                  <Card 
                    key={character.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCharacter === character.id 
                        ? 'ring-2 ring-purple-500 shadow-lg' 
                        : 'hover:shadow-md'
                    } ${character.id === recommendedCharacter ? 'ring-1 ring-yellow-400' : ''}`}
                    onClick={() => setSelectedCharacter(character.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-100 to-teal-100">
                            {character.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {character.name}
                            {character.id === recommendedCharacter && (
                              <Badge variant="secondary" className="text-xs">
                                <Trophy className="w-3 h-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </CardTitle>
                          <Badge variant="outline" className={`text-${character.color}-600`}>
                            {character.role}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {character.specialty}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {character.description}
                        </p>
                        
                        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium">{character.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Level:</span>
                            <span className="font-medium">{character.difficulty}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tutorial Modules:</p>
                          <div className="flex flex-wrap gap-1">
                            {character.modules.slice(0, 2).map((module, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {module}
                              </Badge>
                            ))}
                            {character.modules.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{character.modules.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          {showPersonalization ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowPersonalization(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={() => selectedCharacter && onStartTutorial(selectedCharacter)}
                disabled={!selectedCharacter}
                className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
              >
                Start Tutorial with {selectedCharacter ? tutorialCharacters.find(c => c.id === selectedCharacter)?.name : 'Character'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="flex-1"
            >
              Skip Tutorial for Now
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}