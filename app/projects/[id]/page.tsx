'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';

interface Employee {
  id: string;
  name: string;
  email: string;
  skills: string[];
  currentWorkload: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedHours: number;
  assignedTo?: Employee;
  githubIssueUrl?: string;
  githubPrUrl?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  goals: string[];
  status: string;
  priority: string;
  effortLevel: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  githubRepoUrl?: string;
  requiredSkills: string[];
  budgetHours?: number;
  budgetAmount?: number;
  tasks: Task[];
  assignments: {
    employee: Employee;
    assignedAt: string;
  }[];
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();
      setProject(data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Project not found</p>
          <Link
            href="/projects"
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const getProgress = () => {
    if (project.tasks.length === 0) return 0;
    const completed = project.tasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'assigned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalHoursSpent = project.tasks.reduce(
    (sum, task) => sum + (task.status === 'completed' ? task.estimatedHours : 0),
    0
  );

  const totalEstimatedHours = project.tasks.reduce(
    (sum, task) => sum + task.estimatedHours,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-orange-50 to-orange-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Projects
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {project.title}
              </h1>
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
                <span className="text-gray-600">
                  Priority: <span className="font-semibold capitalize">{project.priority}</span>
                </span>
                <span className="text-gray-600">
                  Effort: <span className="font-semibold capitalize">{project.effortLevel}</span>
                </span>
              </div>
            </div>
            {project.githubRepoUrl && (
              <a
                href={project.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            )}
          </div>
          <p className="text-gray-600 text-lg mb-6">{project.description}</p>

          {/* GitHub Repo Card */}
          {project.githubRepoUrl && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <div>
                    <div className="text-white font-semibold">Repository</div>
                    <div className="text-gray-300 text-sm">{project.githubRepoUrl.replace('https://github.com/', '')}</div>
                  </div>
                </div>
                <a
                  href={project.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  <span>Open Repo</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-700 font-semibold">Overall Progress</span>
              <span className="font-bold text-gray-900 text-lg">
                {getProgress()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-orange-500 h-4 rounded-full transition-all"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-gray-600 text-sm mb-1">Total Tasks</div>
              <div className="text-2xl font-bold text-gray-900">
                {project.tasks.length}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-gray-600 text-sm mb-1">Team Members</div>
              <div className="text-2xl font-bold text-gray-900">
                {project.assignments.length}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-gray-600 text-sm mb-1">Hours Spent</div>
              <div className="text-2xl font-bold text-gray-900">
                {totalHoursSpent}h
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-gray-600 text-sm mb-1">Est. Hours</div>
              <div className="text-2xl font-bold text-gray-900">
                {totalEstimatedHours}h
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Goals */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Goals</h2>
              <ul className="space-y-2">
                {project.goals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tasks</h2>
              {project.tasks.length === 0 ? (
                <p className="text-gray-600">No tasks created yet.</p>
              ) : (
                <div className="space-y-3">
                  {project.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTaskStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          {task.assignedTo && (
                            <span className="text-gray-600">
                              👤 {task.assignedTo.name}
                            </span>
                          )}
                          <span className="text-gray-600">
                            ⏱️ {task.estimatedHours}h
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.githubIssueUrl && (
                            <a
                              href={task.githubIssueUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              Issue
                            </a>
                          )}
                          {task.githubPrUrl && (
                            <a
                              href={task.githubPrUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              PR
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Created</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {project.deadline && (
                  <div>
                    <div className="text-sm text-gray-600">Deadline</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-600">Last Updated</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Team</h2>
              {project.assignments.length === 0 ? (
                <p className="text-gray-600 text-sm">No team members assigned yet.</p>
              ) : (
                <div className="space-y-3">
                  {project.assignments.map((assignment) => (
                    <div
                      key={assignment.employee.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">
                          {assignment.employee.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {assignment.employee.email}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">Workload</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {assignment.employee.currentWorkload}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Required Skills */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium capitalize"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Budget */}
            {(project.budgetHours || project.budgetAmount) && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Budget</h2>
                <div className="space-y-2">
                  {project.budgetHours && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours</span>
                      <span className="font-semibold text-gray-900">
                        {project.budgetHours}h
                      </span>
                    </div>
                  )}
                  {project.budgetAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-semibold text-gray-900">
                        ${project.budgetAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
