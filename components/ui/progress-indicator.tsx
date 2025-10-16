'use client';

import { useState, useEffect } from 'react';
import { Progress, Card, CardBody } from '@heroui/react';

interface ProgressIndicatorProps {
  isActive: boolean;
  title: string;
  description?: string;
  duration?: number;
  onComplete?: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function ProgressIndicator({ 
  isActive, 
  title, 
  description, 
  duration = 2000,
  onComplete,
  color = 'primary'
}: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setStage('');
      return;
    }

    const stages = [
      'Initializing AI...',
      'Processing request...',
      'Generating content...',
      'Finalizing results...'
    ];

    let currentStage = 0;
    let currentProgress = 0;
    const increment = 100 / (duration / 50);

    const interval = setInterval(() => {
      currentProgress += increment;
      
      if (currentProgress >= 100) {
        setProgress(100);
        setStage('Completed!');
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
        }, 500);
        return;
      }

      // Update stage based on progress
      const stageIndex = Math.floor((currentProgress / 100) * stages.length);
      if (stageIndex !== currentStage && stageIndex < stages.length) {
        currentStage = stageIndex;
        setStage(stages[stageIndex]);
      }

      setProgress(currentProgress);
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <Card className="p-4">
      <CardBody className="p-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
              <div 
                className={`absolute inset-0 rounded-full border-2 border-t-${color}-500 animate-spin`}
                style={{
                  animation: 'spin 1s linear infinite'
                }}
              ></div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={progress} 
              color={color}
              size="md"
              className="w-full"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {stage}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
