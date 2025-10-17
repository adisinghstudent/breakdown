'use client';

import { useEffect, useState } from 'react';

interface SetupStep {
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

interface ProjectSetupModalProps {
  projectId: string;
  projectTitle: string;
  onComplete: () => void;
}

export default function ProjectSetupModal({
  projectId,
  projectTitle,
  onComplete,
}: ProjectSetupModalProps) {
  const [steps, setSteps] = useState<SetupStep[]>([
    { label: 'Analyzing project requirements', status: 'in_progress' },
    { label: 'Creating GitHub repository', status: 'pending' },
    { label: 'Generating task breakdown', status: 'pending' },
    { label: 'Assigning team members', status: 'pending' },
    { label: 'Creating GitHub issues', status: 'pending' },
    { label: 'Initializing project workspace', status: 'pending' },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Simulate setup workflow
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const nextIndex = prev + 1;

        if (nextIndex <= steps.length) {
          // Update previous step to completed
          setSteps((currentSteps) =>
            currentSteps.map((step, index) => {
              if (index === prev) return { ...step, status: 'completed' };
              if (index === nextIndex) return { ...step, status: 'in_progress' };
              return step;
            })
          );

          // Check if all steps are done
          if (nextIndex === steps.length) {
            setTimeout(() => {
              onComplete();
            }, 1000);
          }

          return nextIndex;
        }

        return prev;
      });
    }, 2000); // 2 seconds per step

    return () => clearInterval(interval);
  }, [steps.length, onComplete]);

  const getStepIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <svg
            className="w-6 h-6 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'in_progress':
        return (
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        );
      case 'error':
        return (
          <svg
            className="w-6 h-6 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-normal text-gray-900 mb-2">
            Setting Up Your Project
          </h2>
          <p className="text-gray-700 text-lg font-serif italic">
            {projectTitle}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This will take about {steps.length * 2} seconds...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                step.status === 'in_progress'
                  ? 'bg-orange-50 border-2 border-orange-200'
                  : step.status === 'completed'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">{getStepIcon(step.status)}</div>

              {/* Label */}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    step.status === 'in_progress'
                      ? 'text-orange-900'
                      : step.status === 'completed'
                      ? 'text-green-900'
                      : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Status badge */}
              {step.status === 'in_progress' && (
                <span className="text-xs font-semibold text-orange-600">
                  In Progress...
                </span>
              )}
              {step.status === 'completed' && (
                <span className="text-xs font-semibold text-green-600">
                  Complete
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-semibold text-gray-900">
              {Math.round((currentStepIndex / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIndex / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
