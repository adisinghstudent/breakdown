'use client';

import { useState } from 'react';
import type { ClarifyingQuestion } from '@/lib/types';

interface ClarifyingQuestionsModalProps {
  projectId: string;
  questions: ClarifyingQuestion[];
  onComplete: (answers: Record<string, string | string[]>) => void;
  onCancel: () => void;
}

export default function ClarifyingQuestionsModal({
  questions,
  onComplete,
  onCancel,
}: ClarifyingQuestionsModalProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    const questionKey = `question_${currentQuestionIndex}`;
    const answer = answers[questionKey];

    if (currentQuestion.required) {
      if (currentQuestion.type === 'multi-choice') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer && answer.toString().trim() !== '';
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Clarifying Questions
              </h2>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600">
              Help us understand your project better
            </p>
            <div className="mt-4 flex gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full ${
                    index <= currentQuestionIndex ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {currentQuestion.required && (
                <span className="ml-2 text-red-500 text-sm">Required</span>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h3>

            {/* Answer Input */}
            {currentQuestion.type === 'text' && (
              <textarea
                value={(answers[`question_${currentQuestionIndex}`] as string) || ''}
                onChange={(e) =>
                  handleAnswer(`question_${currentQuestionIndex}`, e.target.value)
                }
                placeholder="Your answer..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
              />
            )}

            {currentQuestion.type === 'choice' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      handleAnswer(`question_${currentQuestionIndex}`, option)
                    }
                    className={`w-full px-6 py-4 text-left rounded-lg border-2 transition-all ${
                      answers[`question_${currentQuestionIndex}`] === option
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[`question_${currentQuestionIndex}`] === option
                            ? 'border-white'
                            : 'border-gray-400'
                        }`}
                      >
                        {answers[`question_${currentQuestionIndex}`] === option && (
                          <div className="w-3 h-3 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'multi-choice' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => {
                  const currentAnswers = (answers[`question_${currentQuestionIndex}`] ||
                    []) as string[];
                  const isSelected = currentAnswers.includes(option);

                  return (
                    <button
                      key={option}
                      onClick={() => {
                        const newAnswers = isSelected
                          ? currentAnswers.filter((a) => a !== option)
                          : [...currentAnswers, option];
                        handleAnswer(`question_${currentQuestionIndex}`, newAnswers);
                      }}
                      className={`w-full px-6 py-4 text-left rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'border-white bg-white' : 'border-gray-400'
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-orange-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentQuestionIndex > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastQuestion ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
