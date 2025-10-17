'use client';

import { useState } from 'react';
import type { ProjectDefinition, CoreSkill, PriorityLevel, EffortLevel, ClarifyingQuestion, ProjectSetupResponse } from '@/lib/types';
import ClarifyingQuestionsModal from './ClarifyingQuestionsModal';
import ProjectSetupModal from './ProjectSetupModal';

const CORE_SKILLS: { value: CoreSkill; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'ml', label: 'Machine Learning' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'devops', label: 'DevOps' },
  { value: 'design', label: 'Design' },
  { value: 'ux', label: 'UX Research' },
  { value: 'pm', label: 'Project Management' },
  { value: 'qa', label: 'QA/Testing' },
];

export default function ProjectDefinitionForm() {
  const [formData, setFormData] = useState<Partial<ProjectDefinition>>({
    title: '',
    description: '',
    goals: [''],
    requiredSkills: [],
    priority: 'medium',
    effortLevel: 'medium',
    timelinePreference: 'moderate',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClarifyingQuestions, setShowClarifyingQuestions] = useState(false);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [showSetupModal, setShowSetupModal] = useState(false);

  const handleSkillToggle = (skill: CoreSkill) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.includes(skill)
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...(prev.requiredSkills || []), skill],
    }));
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...(formData.goals || [''])];
    newGoals[index] = value;
    setFormData((prev) => ({ ...prev, goals: newGoals }));
  };

  const addGoal = () => {
    setFormData((prev) => ({
      ...prev,
      goals: [...(prev.goals || []), ''],
    }));
  };

  const removeGoal = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data: ProjectSetupResponse = await response.json();

      if (data.status === 'needs_clarification' && data.clarifyingQuestions) {
        // Show clarifying questions modal
        setProjectId(data.projectId);
        setClarifyingQuestions(data.clarifyingQuestions);
        setShowClarifyingQuestions(true);
      } else {
        // Navigate to project dashboard or show success
        console.log('Project created:', data.projectId);
        // TODO: Navigate to project dashboard
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClarifyingQuestionsComplete = async (answers: Record<string, string | string[]>) => {
    console.log('Clarifying answers:', answers);
    setShowClarifyingQuestions(false);
    setShowSetupModal(true);

    // Submit answers to finalize project setup
    try {
      const response = await fetch('/api/projects/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          answers,
          projectData: formData,
        }),
      });

      const data = await response.json();
      console.log('Project finalized:', data);

      // Setup modal will redirect when complete
    } catch (error) {
      console.error('Failed to finalize project:', error);
      setShowSetupModal(false);
    }
  };

  const handleSetupComplete = () => {
    // Redirect to project detail page
    window.location.href = `/projects/${projectId}`;
  };

  return (
    <>
      {showClarifyingQuestions && (
        <ClarifyingQuestionsModal
          projectId={projectId}
          questions={clarifyingQuestions}
          onComplete={handleClarifyingQuestionsComplete}
          onCancel={() => setShowClarifyingQuestions(false)}
        />
      )}

      {showSetupModal && (
        <ProjectSetupModal
          projectId={projectId}
          projectTitle={formData.title || 'Your Project'}
          onComplete={handleSetupComplete}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-orange-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Define Your Project
          </h1>
          <p className="text-lg text-gray-600">
            Describe your project and let AI handle the rest - from team assembly to task breakdown
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* 1. Project Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Title / Objective
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Customer Dashboard Redesign"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              A clear, concise name for your project
            </p>
          </div>

          {/* 2. Detailed Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Detailed Project Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context about what you're building, why, and any technical requirements..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              AI uses this to generate milestones, task breakdowns, and determine required skills
            </p>
          </div>

          {/* 3. Goals / Deliverables */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Goals / Deliverables
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-2">
              {formData.goals?.map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => handleGoalChange(index, e.target.value)}
                    placeholder="e.g., Implement user authentication system"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                  />
                  {formData.goals && formData.goals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGoal(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addGoal}
              className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              + Add another goal
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Define measurable outputs for progress tracking
            </p>
          </div>

          {/* 4. Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value ? new Date(e.target.value) : undefined })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Timeline Preference
              </label>
              <select
                value={formData.timelinePreference}
                onChange={(e) =>
                  setFormData({ ...formData, timelinePreference: e.target.value as 'flexible' | 'moderate' | 'strict' })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="flexible">Flexible</option>
                <option value="moderate">Moderate</option>
                <option value="strict">Strict</option>
              </select>
            </div>
          </div>

          {/* 5. Team Size & Effort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Effort Level
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                required
                value={formData.effortLevel}
                onChange={(e) =>
                  setFormData({ ...formData, effortLevel: e.target.value as EffortLevel })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="small">Small (1-2 people, 1-2 weeks)</option>
                <option value="medium">Medium (2-4 people, 2-4 weeks)</option>
                <option value="large">Large (4-6 people, 1-2 months)</option>
                <option value="extra-large">Extra Large (6+ people, 2+ months)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Team Size (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={formData.teamSize || ''}
                onChange={(e) =>
                  setFormData({ ...formData, teamSize: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="Number of people"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          {/* 6. Required Skills */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Core Skills / Roles Needed
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CORE_SKILLS.map((skill) => (
                <button
                  key={skill.value}
                  type="button"
                  onClick={() => handleSkillToggle(skill.value)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.requiredSkills?.includes(skill.value)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                  }`}
                >
                  {skill.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              AI will match tasks to employees based on these skills
            </p>
          </div>

          {/* 7. Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Priority / Urgency
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as PriorityLevel[]).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                    formData.priority === priority
                      ? priority === 'high'
                        ? 'bg-red-500 text-white border-red-500'
                        : priority === 'medium'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* 8. Dependencies */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dependencies (Optional)
            </label>
            <input
              type="text"
              value={formData.dependencies?.join(', ') || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dependencies: e.target.value ? e.target.value.split(',').map((d) => d.trim()) : [],
                })
              }
              placeholder="e.g., Authentication API, User Database"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Other systems or projects this depends on (comma-separated)
            </p>
          </div>

          {/* 9. Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Budget (Hours)
              </label>
              <input
                type="number"
                min="1"
                value={formData.budgetHours || ''}
                onChange={(e) =>
                  setFormData({ ...formData, budgetHours: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="e.g., 160"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Budget (Amount)
              </label>
              <input
                type="number"
                min="0"
                value={formData.budgetAmount || ''}
                onChange={(e) =>
                  setFormData({ ...formData, budgetAmount: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="e.g., 50000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Create Project & Get Clarifying Questions'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
