/**
 * Interactive Tutorial Step Component
 * Character-driven step-by-step guidance
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Lightbulb,
  Target,
  Zap,
  MessageCircle
} from 'lucide-react';

interface TutorialStepProps {
  character: {
    name: string;
    avatar: string;
    color: string;
  };
  step: {
    id: string;
    title: string;
    description: string;
    instruction: string;
    tip?: string;
    target?: string; // CSS selector for highlighting
    action?: 'click' | 'hover' | 'type' | 'navigate';
    expectedResult?: string;
  };
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function TutorialStep({
  character,
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onComplete,
  onSkip
}: TutorialStepProps) {
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;

  // Highlight target element
  useEffect(() => {
    if (step.target) {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        setIsHighlighting(true);
        targetElement.classList.add('tutorial-highlight');
        
        // Remove highlight after 3 seconds
        const timer = setTimeout(() => {
          targetElement.classList.remove('tutorial-highlight');
          setIsHighlighting(false);
        }, 3000);

        return () => {
          clearTimeout(timer);
          targetElement.classList.remove('tutorial-highlight');
        };
      }
    }
  }, [step.target]);

  const handleNext = () => {
    setIsCompleted(true);
    setTimeout(() => {
      if (isLastStep && onComplete) {
        onComplete();
      } else {
        onNext();
      }
      setIsCompleted(false);
    }, 300);
  };

  const getActionIcon = () => {
    switch (step.action) {
      case 'click': return <Target className="w-4 h-4" />;
      case 'hover': return <Zap className="w-4 h-4" />;
      case 'type': return <MessageCircle className="w-4 h-4" />;
      case 'navigate': return <ArrowRight className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getActionColor = () => {
    switch (step.action) {
      case 'click': return 'bg-green-500';
      case 'hover': return 'bg-blue-500';
      case 'type': return 'bg-purple-500';
      case 'navigate': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Tutorial overlay styles */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 9999;
          animation: tutorialPulse 2s infinite;
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.4), 0 0 0 8px rgba(168, 85, 247, 0.2);
          border-radius: 8px;
        }

        @keyframes tutorialPulse {
          0% { box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.4), 0 0 0 8px rgba(168, 85, 247, 0.2); }
          50% { box-shadow: 0 0 0 6px rgba(168, 85, 247, 0.6), 0 0 0 12px rgba(168, 85, 247, 0.1); }
          100% { box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.4), 0 0 0 8px rgba(168, 85, 247, 0.2); }
        }

        .tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9998;
          pointer-events: none;
        }
      `}</style>

      {/* Tutorial overlay */}
      {isHighlighting && <div className="tutorial-overlay" />}

      {/* Tutorial step card */}
      <div className="fixed bottom-4 right-4 z-[10000] w-96 max-w-[calc(100vw-2rem)]">
        <Card className="shadow-2xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-lg bg-gradient-to-br from-purple-100 to-teal-100">
                    {character.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">{character.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {totalSteps}
                  </Badge>
                </div>
              </div>
              
              {onSkip && (
                <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs">
                  Skip Tour
                </Button>
              )}
            </div>
            
            <Progress value={progress} className="w-full h-2 mt-2" />
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-base mb-2 flex items-center gap-2">
                {step.action && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${getActionColor()}`}>
                    {getActionIcon()}
                  </div>
                )}
                {step.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {step.description}
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-400">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {step.instruction}
                </p>
              </div>
            </div>

            {step.tip && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTip(!showTip)}
                  className="text-xs text-yellow-600 hover:text-yellow-700 p-0 h-auto"
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  {showTip ? 'Hide Tip' : 'Show Tip'}
                </Button>
                
                {showTip && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-l-4 border-yellow-400">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      💡 {step.tip}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step.expectedResult && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-l-4 border-green-400">
                <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">
                  Expected Result:
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {step.expectedResult}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              size="sm"
              className={`flex-1 ${isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700'}`}
              disabled={isCompleted}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completed!
                </>
              ) : isLastStep ? (
                <>
                  Complete Tutorial
                  <CheckCircle className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}