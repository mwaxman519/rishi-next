/**
 * Tutorial Manager - Main Tutorial System Controller
 * Manages the complete character-driven onboarding experience
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingWelcome from './OnboardingWelcome';
import TutorialStep from './TutorialStep';
import TutorialComplete from './TutorialComplete';
import { 
  tutorialCharacters, 
  getTutorialCharacter, 
  getTotalStepsForCharacter,
  getStepByIndex,
  getRecommendedCharacter 
} from '@/lib/onboarding/tutorialData';

interface TutorialManagerProps {
  user: {
    id: string;
    name: string;
    role: string;
    organization?: string;
  };
  onComplete?: () => void;
  onSkip?: () => void;
}

type TutorialPhase = 'welcome' | 'tutorial' | 'complete';

export default function TutorialManager({ user, onComplete, onSkip }: TutorialManagerProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<TutorialPhase>('welcome');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [tutorialStartTime] = useState(new Date());

  // Save tutorial progress to localStorage
  useEffect(() => {
    if (selectedCharacter && phase === 'tutorial') {
      const progress = {
        characterId: selectedCharacter,
        currentStep: currentStepIndex,
        completedSteps,
        startTime: tutorialStartTime.toISOString(),
        userId: user.id
      };
      localStorage.setItem('tutorial-progress', JSON.stringify(progress));
    }
  }, [selectedCharacter, currentStepIndex, completedSteps, tutorialStartTime, user.id]);

  // Load tutorial progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('tutorial-progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        if (progress.userId === user.id && progress.characterId) {
          setSelectedCharacter(progress.characterId);
          setCurrentStepIndex(progress.currentStep || 0);
          setCompletedSteps(progress.completedSteps || []);
          if (progress.currentStep > 0) {
            setPhase('tutorial');
          }
        }
      } catch (error) {
        console.error('Error loading tutorial progress:', error);
      }
    }
  }, [user.id]);

  const handleStartTutorial = (characterId: string) => {
    setSelectedCharacter(characterId);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setPhase('tutorial');
  };

  const handleNextStep = () => {
    const character = getTutorialCharacter(selectedCharacter);
    if (!character) return;

    const currentStep = getStepByIndex(selectedCharacter, currentStepIndex);
    if (currentStep && !completedSteps.includes(currentStep.id)) {
      setCompletedSteps(prev => [...prev, currentStep.id]);
    }

    const totalSteps = getTotalStepsForCharacter(selectedCharacter);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setPhase('complete');
    
    // Save completion data
    const completionData = {
      characterId: selectedCharacter,
      totalSteps: getTotalStepsForCharacter(selectedCharacter),
      completedSteps: completedSteps.length,
      startTime: tutorialStartTime.toISOString(),
      endTime: new Date().toISOString(),
      duration: Date.now() - tutorialStartTime.getTime(),
      userId: user.id
    };
    
    localStorage.setItem('tutorial-completion', JSON.stringify(completionData));
    localStorage.removeItem('tutorial-progress');

    // Call completion callback after a brief delay
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  const handleSkip = () => {
    localStorage.removeItem('tutorial-progress');
    onSkip?.();
  };

  const handleRestart = () => {
    setPhase('welcome');
    setSelectedCharacter('');
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    localStorage.removeItem('tutorial-progress');
  };

  const character = selectedCharacter ? getTutorialCharacter(selectedCharacter) : null;
  const currentStep = character ? getStepByIndex(selectedCharacter, currentStepIndex) : null;
  const totalSteps = character ? getTotalStepsForCharacter(selectedCharacter) : 0;

  if (phase === 'welcome') {
    return (
      <OnboardingWelcome
        user={user}
        onStartTutorial={handleStartTutorial}
        onSkip={handleSkip}
      />
    );
  }

  if (phase === 'tutorial' && character && currentStep) {
    return (
      <TutorialStep
        character={{
          name: character.name,
          avatar: character.avatar,
          color: character.color
        }}
        step={currentStep}
        currentStep={currentStepIndex}
        totalSteps={totalSteps}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    );
  }

  if (phase === 'complete' && character) {
    return (
      <TutorialComplete
        character={{
          name: character.name,
          avatar: character.avatar,
          color: character.color
        }}
        completedSteps={completedSteps.length}
        totalSteps={totalSteps}
        duration={Date.now() - tutorialStartTime.getTime()}
        onFinish={onComplete || (() => router.push('/dashboard'))}
        onRestart={handleRestart}
      />
    );
  }

  return null;
}