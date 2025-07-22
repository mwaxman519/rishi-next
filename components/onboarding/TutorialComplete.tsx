/**
 * Tutorial Completion Component
 * Celebration and summary of completed tutorial
 */

"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle,
  Trophy,
  Clock,
  Target,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Star
} from 'lucide-react';

interface TutorialCompleteProps {
  character: {
    name: string;
    avatar: string;
    color: string;
  };
  completedSteps: number;
  totalSteps: number;
  duration: number; // milliseconds
  onFinish: () => void;
  onRestart: () => void;
}

export default function TutorialComplete({
  character,
  completedSteps,
  totalSteps,
  duration,
  onFinish,
  onRestart
}: TutorialCompleteProps) {
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  const durationMinutes = Math.round(duration / (1000 * 60));
  
  const getCompletionMessage = () => {
    if (completionPercentage === 100) {
      return "Outstanding! You've mastered all the tutorial steps!";
    } else if (completionPercentage >= 80) {
      return "Excellent work! You've completed most of the tutorial!";
    } else if (completionPercentage >= 60) {
      return "Good job! You've learned the key features!";
    } else {
      return "Great start! You've begun your journey with the platform!";
    }
  };

  const getAchievementBadges = () => {
    const badges = [];
    
    if (completionPercentage === 100) {
      badges.push({ text: "Tutorial Master", color: "bg-yellow-500", icon: <Trophy className="w-3 h-3" /> });
    }
    
    if (durationMinutes <= 10) {
      badges.push({ text: "Speed Learner", color: "bg-blue-500", icon: <Sparkles className="w-3 h-3" /> });
    }
    
    if (completedSteps >= 5) {
      badges.push({ text: "Dedicated Learner", color: "bg-green-500", icon: <Target className="w-3 h-3" /> });
    }
    
    badges.push({ text: "Platform Explorer", color: "bg-purple-500", icon: <Star className="w-3 h-3" /> });
    
    return badges;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Tutorial Complete!
          </CardTitle>
          
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {getCompletionMessage()}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Character Thanks */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-100 to-teal-100">
                  {character.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{character.name}</h3>
                <Badge variant="secondary" className="text-xs">Your Tutorial Guide</Badge>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 italic">
              "It was wonderful guiding you through the Rishi Platform! You're now ready to make the most of all the features we explored together."
            </p>
          </div>

          {/* Progress Summary */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{completedSteps}/{totalSteps}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Steps Completed</p>
                  </div>
                </div>
                <Progress value={completionPercentage} className="mt-3 h-3" />
                <p className="text-xs text-gray-500 mt-1">{completionPercentage}% Complete</p>
              </CardContent>
            </Card>

            <Card className="border border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{durationMinutes}min</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Time Invested</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge variant="secondary" className="text-xs">
                    Excellent Learning Pace!
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Achievements Unlocked
            </h3>
            <div className="flex flex-wrap gap-2">
              {getAchievementBadges().map((badge, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm font-medium ${badge.color}`}
                >
                  {badge.icon}
                  {badge.text}
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-purple-100 to-teal-100 dark:from-purple-900/30 dark:to-teal-900/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Start exploring the features you learned about</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Check out the help documentation for advanced tips</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Connect with your team to collaborate effectively</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Return to this tutorial anytime from your profile</span>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
          <Button 
            variant="outline" 
            onClick={onRestart}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Restart Tutorial
          </Button>
          <Button 
            onClick={onFinish}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            Continue to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}