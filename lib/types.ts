// Project Definition Types

export type PriorityLevel = 'low' | 'medium' | 'high';
export type EffortLevel = 'small' | 'medium' | 'large' | 'extra-large';

export type CoreSkill =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'ml'
  | 'data-science'
  | 'devops'
  | 'design'
  | 'ux'
  | 'pm'
  | 'qa';

export interface ProjectDefinition {
  // 1. Project Title
  title: string;

  // 2. Detailed Description
  description: string;

  // 3. Goals / Deliverables
  goals: string[];

  // 4. Timeline
  deadline?: Date;
  timelinePreference?: 'flexible' | 'moderate' | 'strict';

  // 5. Team Size / Effort
  effortLevel: EffortLevel;
  teamSize?: number;

  // 6. Required Skills
  requiredSkills: CoreSkill[];

  // 7. Priority
  priority: PriorityLevel;

  // 8. Dependencies
  dependencies?: string[]; // Project IDs or names

  // 9. Budget/Effort Cap
  budgetHours?: number;
  budgetAmount?: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  skills: CoreSkill[];
  currentWorkload: number; // 0-100
  availability: 'available' | 'busy' | 'unavailable';
  currentProjects: string[];
  performanceScore?: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo?: string; // Employee ID
  requiredSkills: CoreSkill[];
  estimatedHours: number;
  priority: PriorityLevel;
  status: 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed';
  githubIssueUrl?: string;
  githubPrUrl?: string;
  dependencies?: string[]; // Other task IDs
}

export interface Project {
  id: string;
  definition: ProjectDefinition;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  githubRepoUrl?: string;
  tasks: Task[];
  assignedEmployees: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClarifyingQuestion {
  question: string;
  type: 'text' | 'choice' | 'multi-choice';
  options?: string[];
  required: boolean;
}

export interface ProjectSetupResponse {
  projectId: string;
  clarifyingQuestions?: ClarifyingQuestion[];
  status: 'needs_clarification' | 'ready_to_setup';
}
